/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/src/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/src/draganddrop.ts":
/*!*******************************!*\
  !*** ./js/src/draganddrop.ts ***!
  \*******************************/
/*! exports provided: Sortable */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Sortable", function() { return Sortable; });
/**
 * 順序情報を変更するために一覧の表を直接ドラッグ&ドロップ
 */
var Sortable = /** @class */ (function () {
    /**
     * 初期設定
     * 各プロパティの初期値を設定
     * pinchClassはつまみ要素のクラス
     * listClassはwrapClass直下にある各要素のクラス
     * wrapClassはリストをラップするクラス
     * isDragClassはドラッグ途中のみリスト要素へ追加されるクラス
     * startとendはバックエンドへ送るデータ
     */
    function Sortable(wrapperClass, pinchClass, isDragClass) {
        if (wrapperClass === void 0) { wrapperClass = 'sortable-wrapper'; }
        if (pinchClass === void 0) { pinchClass = 'sortable-pinch'; }
        if (isDragClass === void 0) { isDragClass = 'sortable-drug'; }
        var _this = this;
        /**
         * pinchElementの先祖要素のうち、this.elementに登録されたリスト要素を探す
         * 該当するものが無ければundefinedを返す
         * @param {HTMLElement} pinchElement
         * @return {HTMLElement | undefined}
         * @private
         */
        this._findPinchParent = function (pinchElement) {
            var parent = pinchElement.parentElement;
            loop: while (parent !== null && parent instanceof HTMLElement) {
                for (var i = 0; i < _this.elements.length; i++) {
                    if (_this.elements.item(i) === parent) {
                        break loop;
                    }
                }
                parent = parent.parentElement;
            }
            return parent.parentElement === null ? undefined : parent;
        };
        /**
         * 自分の親要素を順々に辿っていき、this.wraClassを持った要素があるか検証する
         * @param {HTMLElement} e
         * @param {string} className
         * @return {HTMLElement | undefined}
         */
        this._isWrap = function (e) {
            var parent = e.parentElement;
            while (parent !== null && !parent.classList.contains(_this.wrapperClassName) && parent instanceof HTMLElement) {
                parent = parent.parentElement;
            }
            return parent !== null;
        };
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
        document.addEventListener('mouseup', function (e) { _this._mUp(e); }, false);
    }
    /**
     * wrapper, elements, list等の要素を初期化する
     * 各要素のスタイル設定も行う
     * さらにdummyListの登録を解除する
     * @private
     */
    Sortable.prototype._initList = function () {
        var _this = this;
        //wrapper要素の初期化登録
        this.wrapper = document.querySelector('.' + this.wrapperClassName);
        //要素リストの初期化登録
        this.elements = this.wrapper.children;
        //this.listの初期化
        this.list = [];
        //dummyListの解除
        this.dummyList = null;
        //各リスト要素に対して高さ情報(data-top)を設定
        //さらに各リスト内のpinchClassを持った要素へイベントを紐づける
        for (var i = 0; i < this.elements.length; i++) {
            //参照ターゲット
            var target = this.elements.item(i);
            //各要素内のつまめるボタン
            var pinchTarget = target.querySelector('.' + this.pinchClassName);
            //つまめるボタンへイベントを登録
            if (pinchTarget) {
                pinchTarget.addEventListener('mousedown', function (e) { _this._mDown(e); }, false);
            }
        }
    };
    /**
     * 移動中のリスト要素に最低限必要なスタイルを当てる
     * resetをtrueにするとこのメソッドによって適用されたスタイル解除される
     * @param {HTMLElement} list
     * @param {number} y
     * @param {boolean} reset
     * @private
     */
    Sortable.prototype._drugStyle = function (list, y, reset) {
        if (reset === void 0) { reset = false; }
        //子要素配列
        var children = list.children;
        //このメソッドによって適用されたスタイルを全て削除する
        if (reset) {
            for (var i = 0; i < children.length; i++) {
                var child = children.item(i);
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
        for (var i = 0; i < children.length; i++) {
            var child = children.item(i);
            var wind_1 = child.ownerDocument.defaultView;
            child.style.width = wind_1.getComputedStyle(child, null).width;
        }
        var wind = list.ownerDocument.defaultView;
        list.style.width = wind.getComputedStyle(list, null).width;
        list.style.display = 'flex';
        list.style.zIndex = '3';
        list.style.position = 'absolute';
        list.style.top = (y - (list.getBoundingClientRect().height / 2)) + 'px';
    };
    /**
     * index指定された要素の周りにdummyリストを移動させる
     * upがtrueなら後に、falseなら前に表示
     * @param {number} index
     * @param {boolean} after
     * @private
     */
    Sortable.prototype._moveDummyList = function (index, after) {
        if (after === void 0) { after = true; }
        //dummyListが存在しなかったら処理終了
        if (this.dummyList === null) {
            return;
        }
        //操作対象の定義
        var target = after ? this.list[index].element.nextElementSibling : this.list[index].element;
        //dummy要素を移動させる
        this.wrapper.insertBefore(this.dummyList, target);
    };
    /**
     * wrapperのinnerHTMLをthis.listの情報を元に書き換える
     * @private
     */
    Sortable.prototype._renderWrap = function () {
        //wrapper内を書き換えるためのデータ配列:ドラッグ中の要素より前
        var before = [];
        //wrapper内を書き換えるためのデータ配列:ドラッグ中の要素より後
        var after = [];
        //wrapper内を書き換えるためのデータ: ドラッグ中要素のouterHTML
        var druggedHTML = '';
        //ドロップ時の見た目と同じ順番でchildrenへ情報をプッシュする
        for (var i = 0; i < this.list.length; i++) {
            //ドラッグ中の項目だったらdruggedHTMLをセット
            if (this.list[i].drag) {
                druggedHTML = this.list[i].element.outerHTML;
                continue;
            }
            //項目を挿入
            var targetArray = this.list[i].up ? before : after;
            targetArray.push(this.list[i].element.outerHTML);
        }
        //wrapperのinnerHTMLを再描画する
        this.wrapper.innerHTML = before.join('') + druggedHTML + after.join('');
    };
    /**
     * ツマミをドラッグしようとした瞬間に呼ばれる
     * @param {Admin.HTMLMouseEvent<HTMLElement>} e
     */
    Sortable.prototype._mDown = function (e) {
        var _this = this;
        //現在操作ロック中・もしくはドラック中の要素が既に存在する場合は処理中断
        if (this.lock || document.querySelector('.' + this.isDragClassName) || !this._isWrap(e.target)) {
            return;
        }
        //先祖要素にあたるリスト要素の取得
        var list = this._findPinchParent(e.target);
        //リスト要素のクラス名に .drag を追加
        list.classList.add(this.isDragClassName);
        //リスト要素のstyleをドラッグ中用のものに変更
        this._drugStyle(list, e.pageY);
        //documentのmousemoveイベントに_mMoveを登録する
        this.moveCallback = function (e) { _this._mMove(e); };
        document.addEventListener('mousemove', this.moveCallback, false);
        //リスト情報の更新
        //リスト情報を一旦空にする
        this.list = [];
        //そのリストがドラッグ途中のリストより上に表示されていたリストかどうか
        var isHigher = true;
        //そのリストがドラッグ途中のリストかどうか
        var isDrag = false;
        //ドラッグされている要素のindex
        var drugIndex = -1;
        //ドラッグされている要素のindex
        var dummyOriginal = null;
        //this.elementsの情報を元にループ処理
        for (var i = 0; i < this.elements.length; i++) {
            //参照中のリスト要素
            var element = this.elements.item(i);
            //もし参照中のリストがドラッグ途中であればisHigherとisDragをtrueにする
            //isDrugはループ終了間近にfalseへ戻るが、isHigherは以後ずっとfalseになる
            //さらにダミー要素のコピー元情報としての情報も保持する
            if (element.classList.contains(this.isDragClassName)) {
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
        if (dummyOriginal !== null) {
            //要素の作成
            var dummyElement = document.createElement(dummyOriginal.tagName);
            dummyElement.innerHTML = dummyOriginal.innerHTML;
            dummyElement.style.opacity = '0.5';
            //要素の挿入・登録
            this.wrapper.appendChild(dummyElement);
            this.dummyList = dummyElement;
            //要素の移動
            this._moveDummyList(drugIndex);
        }
    };
    /**
     * ツマミをドラッグ移動中に発動する処理集
     * カーソル位置にドラッグ途中の要素を追従させ、他要素の位置を超えたら順序を入れ替える
     * @param {Admin.HTMLMouseEvent<HTMLElement>} e
     * @private
     */
    Sortable.prototype._mMove = function (e) {
        //ロック中、もしくはドラッグ中の要素が存在しなかったら処理しない
        if (this.lock || !document.querySelector('.' + this.isDragClassName)) {
            return;
        }
        //画面を動かさないようにデフォルト操作を抑制
        e.preventDefault();
        //ドラッグしている要素を取得
        var target = document.querySelector('.' + this.isDragClassName);
        //マウスが動いた場所を算出し
        var nowY = e.pageY - (target.clientHeight / 2);
        //その位置にリストを動かす
        target.style.top = nowY + 'px';
        //負荷が高いので、0.1秒単位でしか動作させないようにする
        //前回実行時より0.1秒以上経っていない場合は処理をここで中断
        var nowTime = new Date().getTime();
        if (this.time + 100 > nowTime) {
            return;
        }
        //次回処理の制限のためthis.timeを更新
        this.time = nowTime;
        //mousedownイベント発生時に更新したthis.listのデータを元にループ処理
        for (var i = 0; i < this.list.length; i++) {
            //ドラッグ中の要素は無視する
            if (this.list[i].element.classList.contains(this.isDragClassName)) {
                continue;
            }
            //参照中リスト要素の中央高さ
            var line = window.pageYOffset + this.list[i].element.getBoundingClientRect().top + (this.list[i].element.clientHeight / 2);
            //参照中リストを移動するか、兼、どのように移動するかの識別変数
            var move = null;
            //ドラッグする前にドラッグ中の要素より参照中の要素が下に位置していた
            //かつ、ドラッグ位置が参照中リストの中央線を下へ越えた場合、要素を上にずらす
            move = !this.list[i].up && line < nowY ? true : move;
            //逆にドラッグする前にドラッグ中の要素より参照中の要素が上に位置していた
            //かつ、ドラッグ位置が参照中リストの中央線を上へ越えた場合、要素を下にずらす
            move = this.list[i].up && line > nowY ? false : move;
            //参照中カラムの移動実行
            if (move !== null) {
                //ダミー要素を参照中要素の位置まで移動
                this._moveDummyList(i, move);
                //参照中要素のupを反転させる
                this.list[i].up = !this.list[i].up;
            }
        }
    };
    /**
     * ツマミを離した瞬間に行う処理
     * listデータを元にhtmlを再描画した後、各要素情報を更新する
     * @private
     */
    Sortable.prototype._mUp = function (e) {
        //ロック中、もしくはドラッグ中の要素が存在しなかったら処理しない
        if (this.lock || !document.querySelector('.' + this.isDragClassName) || !this._isWrap(e.target)) {
            return;
        }
        //_mMoveイベントを解除
        document.removeEventListener('mousemove', this.moveCallback, false);
        this.moveCallback = function () { };
        //バックエンドと通信する予定のメソッド
        this.connectAPI(this.list);
        //wrapperのinnerHTMLを書き換える
        this._renderWrap();
        //情報の初期化
        this._initList();
        //ドラッグ中クラスの削除・スタイルの初期化
        var druggedTarget = document.querySelector('.' + this.isDragClassName);
        if (druggedTarget) {
            druggedTarget.classList.remove(this.isDragClassName);
            this._drugStyle(druggedTarget, 0, true);
        }
    };
    /**
     * this.lockの値を書き換える
     * trueにしておくとその間このクラス内の機能が停止する
     * 恐らく以下のconnectAPI中で使うと効果的
     * @param {boolean} lock
     */
    Sortable.prototype.setLock = function (lock) {
        this.lock = lock;
    };
    /**
     * ドロップした瞬間のthis.listの情報を持ってくる空のメソッド
     * もし使う場合はこのクラスを継承させて子でオーバーライドする
     * @param {Array<SortableListData>} list
     */
    Sortable.prototype.connectAPI = function (list) { };
    return Sortable;
}());



/***/ }),

/***/ "./js/src/main.ts":
/*!************************!*\
  !*** ./js/src/main.ts ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _draganddrop_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./draganddrop.ts */ "./js/src/draganddrop.ts");

window.addEventListener('DOMContentLoaded', function () {
    var sortable = new _draganddrop_ts__WEBPACK_IMPORTED_MODULE_0__["Sortable"]();
    var sortable2 = new _draganddrop_ts__WEBPACK_IMPORTED_MODULE_0__["Sortable"]('sortable-wrapper2');
}, false);


/***/ })

/******/ });
//# sourceMappingURL=install.bundle.js.map