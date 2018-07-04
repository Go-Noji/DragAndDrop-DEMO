import {Sortable} from './DragAndDrop.ts';

window.addEventListener('DOMContentLoaded', () =>
{
  const sortable = new Sortable();
  const sortable2 = new Sortable('sortable-wrapper2');
}, false);
