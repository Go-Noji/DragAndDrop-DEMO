/**
 * Event型を受け取るときに、そのtargetプロパティの型
 */
interface HTMLMouseEvent<T extends HTMLElement> extends MouseEvent {
  target: T;
}

/**
 * 並び替え可能なリストのデータ
 * elementにHTMLElement情報
 * up に今掴まれている要素より上に表示されているか、下に表示されているか
 * dragにその要素が掴まれているか否か
 */
interface SortableListData {
  element: HTMLElement,
  up: boolean,
  drag: boolean
}

/**
 * 順序情報を変更するために一覧の表を直接ドラッグ&ドロップ
 */
export class Sortable {

  /**
   * 現在操作をロックしているかどうか
   * 最初はfalseがセットされる
   * @type {boolean}
   */
  private lock: boolean;

  /**
   * documentのmousemoveイベントに紐づけられるイベント
   * removeEventListenerを発動させるために登録
   */
  private moveCallback: (e: HTMLMouseEvent<HTMLElement>) => void;

  /**
   * ドラッグし始めのカーソルy座標
   * @type {number}
   */
  private y: number;

  /**
   * 要素のドラッグが始まった瞬間に更新される要素リスト
   * elementにHTMLElement情報
   * up に今掴まれている要素より上に表示されているか、下に表示されているか
   * dragにその要素が掴まれているか否か
   * topにその要素のY座標
   * が格納される
   */
  private list: Array<SortableListData>;

  /**
   * コンストラクタで現在時刻のタイムスタンプが登録される
   */
  private time: number;

  /**
   * リスト要素コレクション
   */
  private elements: HTMLCollection;

  /**
   * 各リスト直近の親となる要素
   * ul/liだったらul, tableだったらtbody等
   */
  private wrapper: HTMLElement;

  /**
   * ドラッグ中にのみ出現させるダミー要素
   * ドロップした場合の着地地点に出現する
   */
  private dummyList: HTMLElement|null;

  /**
   * リスト要素の親要素クラス名
   */
  readonly wrapperClassName: string;

  /**
   * リスト要素内のつまめる要素クラス名
   */
  readonly pinchClassName: string;

  /**
   * ドラッグ中にだけ要素へ付くクラス名
   * @type {string}
   */
  readonly isDragClassName: string;

  /**
   * 初期設定
   * 各プロパティの初期値を設定
   * pinchClassはつまみ要素のクラス
   * listClassはwrapClass直下にある各要素のクラス
   * wrapClassはリストをラップするクラス
   * isDragClassはドラッグ途中のみリスト要素へ追加されるクラス
   * startとendはバックエンドへ送るデータ
   */
  constructor(wrapperClass: string = 'sortable-wrapper', pinchClass: string = 'sortable-pinch', isDragClass: string = 'sortable-drug')
  {
    //各プロパティの初期値を設定
    this.lock = false;
    this.y = 0;
    this.list = [];
    this.time = new Date().getTime();
    this.dummyList = null;

    //引数をプロパティへセット
    this.wrapperClassName = wrapperClass;
    this.pinchClassName = pinchClass;
    this.isDragClassName = isDragClass;

    //情報の初期化
    this._initList();

    //マウスボタンが離された時用のイベントを登録(bodyにも登録しておく)
    document.addEventListener('mouseup', (e: HTMLMouseEvent<HTMLElement>) => {this._mUp(e)}, false);
  }

  /**
   * wrapper, elements, list等の要素を初期化する
   * 各要素のスタイル設定も行う
   * さらにdummyListの登録を解除する
   * @private
   */
  private _initList()
  {
    //wrapper要素の初期化登録
    this.wrapper = document.querySelector('.'+this.wrapperClassName);

    //要素リストの初期化登録
    this.elements = this.wrapper.children;

    //this.listの初期化
    this.list = [];

    //dummyListの解除
    this.dummyList = null;

    //各リスト要素に対して高さ情報(data-top)を設定
    //さらに各リスト内のpinchClassを持った要素へイベントを紐づける
    for (let i = 0; i < this.elements.length; i++)
    {
      //参照ターゲット
      const target: HTMLElement = <HTMLElement>this.elements.item(i);

      //各要素内のつまめるボタン
      const pinchTarget = target.querySelector('.'+this.pinchClassName);

      //つまめるボタンへイベントを登録
      if (pinchTarget)
      {
        pinchTarget.addEventListener('mousedown', (e: HTMLMouseEvent<HTMLElement>) => {this._mDown(e)}, false);
      }
    }
  }

  /**
   * 移動中のリスト要素に最低限必要なスタイルを当てる
   * resetをtrueにするとこのメソッドによって適用されたスタイル解除される
   * @param {HTMLElement} list
   * @param {number} y
   * @param {boolean} reset
   * @private
   */
  private _drugStyle(list: HTMLElement, y: number, reset: boolean = false)
  {
    //子要素配列
    const children: HTMLCollection = list.children;

    //このメソッドによって適用されたスタイルを全て削除する
    if (reset)
    {
      for (let i = 0; i < children.length; i++)
      {
        const child: HTMLElement = <HTMLElement>children.item(i);
        child.style.width = '';
      }

      list.style.width = '';
      list.style.display = '';
      list.style.zIndex = '';
      list.style.position = '';
      list.style.top = '';
      return;
    }

    //スタイルを当てる
    for (let i = 0; i < children.length; i++)
    {
      const child: HTMLElement = <HTMLElement>children.item(i);
      const wind: Window = child.ownerDocument.defaultView;
      child.style.width = wind.getComputedStyle(child, null).width;
    }

    const wind: Window = list.ownerDocument.defaultView;
    list.style.width = wind.getComputedStyle(list, null).width;
    list.style.display = 'flex';
    list.style.zIndex = '3';
    list.style.position = 'absolute';
    list.style.top = (y - (list.getBoundingClientRect().height / 2))+'px';
  }

  /**
   * index指定された要素の周りにdummyリストを移動させる
   * upがtrueなら後に、falseなら前に表示
   * @param {number} index
   * @param {boolean} after
   * @private
   */
  private _moveDummyList(index: number, after: boolean = true)
  {
    //dummyListが存在しなかったら処理終了
    if (this.dummyList === null)
    {
      return;
    }

    //操作対象の定義
    const target = after ? this.list[index].element.nextElementSibling : this.list[index].element;

    //dummy要素を移動させる
    this.wrapper.insertBefore(this.dummyList, target);
  }

  /**
   * wrapperのinnerHTMLをthis.listの情報を元に書き換える
   * @private
   */
  private _renderWrap()
  {
    //wrapper内を書き換えるためのデータ配列:ドラッグ中の要素より前
    let before: Array<string> = [];

    //wrapper内を書き換えるためのデータ配列:ドラッグ中の要素より後
    let after: Array<string> = [];

    //wrapper内を書き換えるためのデータ: ドラッグ中要素のouterHTML
    let druggedHTML: string = '';

    //ドロップ時の見た目と同じ順番でchildrenへ情報をプッシュする
    for (var i = 0; i < this.list.length; i++)
    {
      //ドラッグ中の項目だったらdruggedHTMLをセット
      if (this.list[i].drag)
      {
        druggedHTML = this.list[i].element.outerHTML;
        continue;
      }

      //項目を挿入
      const targetArray: Array<string> = this.list[i].up ? before : after;
      targetArray.push(this.list[i].element.outerHTML);
    }

    //wrapperのinnerHTMLを再描画する
    this.wrapper.innerHTML = before.join('')+druggedHTML+after.join('');
  }

  /**
   * pinchElementの先祖要素のうち、this.elementに登録されたリスト要素を探す
   * 該当するものが無ければundefinedを返す
   * @param {HTMLElement} pinchElement
   * @return {HTMLElement | undefined}
   * @private
   */
  private _findPinchParent = (pinchElement: HTMLElement): HTMLElement|undefined =>
  {
    let parent: Element = pinchElement.parentElement;
    loop: while (parent !== null && parent instanceof HTMLElement)
    {
      for (let i = 0; i < this.elements.length; i++)
      {
        if (this.elements.item(i) === parent)
        {
          break loop;
        }
      }

      parent = parent.parentElement;
    }

    return parent.parentElement === null ? undefined : <HTMLElement>parent;
  }

  /**
   * 自分の親要素を順々に辿っていき、this.wraClassを持った要素があるか検証する
   * @param {HTMLElement} e
   * @param {string} className
   * @return {HTMLElement | undefined}
   */
  private _isWrap = (e: HTMLElement): boolean =>
  {
    let parent: Element = e.parentElement;
    while (parent !== null && ! parent.classList.contains(this.wrapperClassName) && parent instanceof HTMLElement)
    {
      parent = parent.parentElement;
    }
    return parent !== null;
  }

  /**
   * ツマミをドラッグしようとした瞬間に呼ばれる
   * @param {Admin.HTMLMouseEvent<HTMLElement>} e
   */
  private _mDown(e: HTMLMouseEvent<HTMLElement>)
  {
    //現在操作ロック中・もしくはドラック中の要素が既に存在する場合は処理中断
    if (this.lock || document.querySelector('.'+this.isDragClassName) || ! this._isWrap(e.target))
    {
      return;
    }

    //先祖要素にあたるリスト要素の取得
    const list: HTMLElement = this._findPinchParent(e.target);

    //リスト要素のクラス名に .drag を追加
    list.classList.add(this.isDragClassName);

    //リスト要素のstyleをドラッグ中用のものに変更
    this._drugStyle(list, e.pageY);

    //documentのmousemoveイベントに_mMoveを登録する
    this.moveCallback = (e: HTMLMouseEvent<HTMLElement>) => {this._mMove(e)};
    document.addEventListener('mousemove', this.moveCallback, false);

    //リスト情報の更新
    //リスト情報を一旦空にする
    this.list = [];

    //そのリストがドラッグ途中のリストより上に表示されていたリストかどうか
    let isHigher: boolean = true;

    //そのリストがドラッグ途中のリストかどうか
    let isDrag: boolean = false;

    //ドラッグされている要素のindex
    let drugIndex: number = -1;

    //ドラッグされている要素のindex
    let dummyOriginal: HTMLElement|null = null;

    //this.elementsの情報を元にループ処理
    for (var i = 0; i < this.elements.length; i++)
    {
      //参照中のリスト要素
      const element: HTMLElement = <HTMLElement>this.elements.item(i);

      //もし参照中のリストがドラッグ途中であればisHigherとisDragをtrueにする
      //isDrugはループ終了間近にfalseへ戻るが、isHigherは以後ずっとfalseになる
      //さらにダミー要素のコピー元情報としての情報も保持する
      if(element.classList.contains(this.isDragClassName))
      {
        isHigher = false;
        isDrag = true;

        drugIndex = i;
        dummyOriginal = element;
      }

      //リスト情報の追加
      this.list.push({
        'element': element,
        'up': isHigher,
        'drag': isDrag
      });

      //次回ループ開始時のisDrag初期値をfalseにする
      isDrag = false;
    }

    //ダミー要素の作成・登録・移動
    if (dummyOriginal !== null)
    {
      //要素の作成
      const dummyElement = document.createElement(dummyOriginal.tagName);
      dummyElement.innerHTML = dummyOriginal.innerHTML;
      dummyElement.style.opacity = '0.5';

      //要素の挿入・登録
      this.wrapper.appendChild(dummyElement);
      this.dummyList = dummyElement;

      //要素の移動
      this._moveDummyList(drugIndex);
    }
  }

  /**
   * ツマミをドラッグ移動中に発動する処理集
   * カーソル位置にドラッグ途中の要素を追従させ、他要素の位置を超えたら順序を入れ替える
   * @param {Admin.HTMLMouseEvent<HTMLElement>} e
   * @private
   */
  private _mMove(e: HTMLMouseEvent<HTMLElement>)
  {
    //ロック中、もしくはドラッグ中の要素が存在しなかったら処理しない
    if (this.lock || ! document.querySelector('.'+this.isDragClassName))
    {
      return;
    }

    //画面を動かさないようにデフォルト操作を抑制
    e.preventDefault();

    //ドラッグしている要素を取得
    const target: HTMLElement = document.querySelector('.'+this.isDragClassName);

    //マウスが動いた場所を算出し
    const nowY: number = e.pageY - (target.clientHeight / 2);

    //その位置にリストを動かす
    target.style.top = nowY+'px';

    //負荷が高いので、0.1秒単位でしか動作させないようにする
    //前回実行時より0.1秒以上経っていない場合は処理をここで中断
    const nowTime = new Date().getTime();
    if (this.time + 100 > nowTime)
    {
      return;
    }

    //次回処理の制限のためthis.timeを更新
    this.time = nowTime;

    //mousedownイベント発生時に更新したthis.listのデータを元にループ処理
    for (let i = 0; i < this.list.length; i++)
    {
      //ドラッグ中の要素は無視する
      if (this.list[i].element.classList.contains(this.isDragClassName))
      {
        continue;
      }

      //参照中リスト要素の中央高さ
      const line: number = window.pageYOffset + this.list[i].element.getBoundingClientRect().top + (this.list[i].element.clientHeight / 2);

      //参照中リストを移動するか、兼、どのように移動するかの識別変数
      let move: boolean|null = null;

      //ドラッグする前にドラッグ中の要素より参照中の要素が下に位置していた
      //かつ、ドラッグ位置が参照中リストの中央線を下へ越えた場合、要素を上にずらす
      move = ! this.list[i].up && line < nowY ? true : move;

      //逆にドラッグする前にドラッグ中の要素より参照中の要素が上に位置していた
      //かつ、ドラッグ位置が参照中リストの中央線を上へ越えた場合、要素を下にずらす
      move = this.list[i].up && line > nowY ? false : move;

      //参照中カラムの移動実行
      if (move !== null)
      {
        //ダミー要素を参照中要素の位置まで移動
        this._moveDummyList(i, move);

        //参照中要素のupを反転させる
        this.list[i].up = ! this.list[i].up;
      }
    }
  }

  /**
   * ツマミを離した瞬間に行う処理
   * listデータを元にhtmlを再描画した後、各要素情報を更新する
   * @private
   */
  private _mUp(e: HTMLMouseEvent<HTMLElement>)
  {
    //ロック中、もしくはドラッグ中の要素が存在しなかったら処理しない
    if (this.lock || ! document.querySelector('.'+this.isDragClassName) || ! this._isWrap(e.target))
    {
      return;
    }

    //_mMoveイベントを解除
    document.removeEventListener('mousemove', this.moveCallback, false);
    this.moveCallback = () => {};

    //バックエンドと通信する予定のメソッド
    this.connectAPI(this.list);

    //wrapperのinnerHTMLを書き換える
    this._renderWrap();

    //情報の初期化
    this._initList();

    //ドラッグ中クラスの削除・スタイルの初期化
    const druggedTarget: HTMLElement = document.querySelector('.'+this.isDragClassName);
    if (druggedTarget)
    {
      druggedTarget.classList.remove(this.isDragClassName);

      this._drugStyle(druggedTarget, 0, true);
    }
  }

  /**
   * this.lockの値を書き換える
   * trueにしておくとその間このクラス内の機能が停止する
   * 恐らく以下のconnectAPI中で使うと効果的
   * @param {boolean} lock
   */
  protected setLock(lock: boolean)
  {
    this.lock = lock;
  }

  /**
   * ドロップした瞬間のthis.listの情報を持ってくる空のメソッド
   * もし使う場合はこのクラスを継承させて子でオーバーライドする
   * @param {Array<SortableListData>} list
   */
  protected connectAPI(list: Array<SortableListData>)
  {}

}
