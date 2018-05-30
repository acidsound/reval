import {Blaze} from 'meteor/blaze';

let createView = Blaze._createView;
Blaze._createView = function(view, parentView, forExpansion) {
  view._dep = new Tracker.Dependency();

  let render = view._render;
  view._render = function() {
    view._dep.depend();
    return render.apply(view, arguments);
  };
  view.rerender = () => view._dep.changed();

  return createView.call(this, view, parentView, forExpansion);
};

let getRoot = function(elem, baseView) {
  let view = Blaze.getView(elem);
  if (!elem) {
    return;
  }

  while (view && view.parentView && view !== baseView) {
    view = view.originalParentView || view.parentView;
  }

  return view;
};

let getRoots = function(base) {
  let roots = new Set(),
      baseElem = $(base)[0],
      baseView = Blaze.getView(baseElem)
  ;

  $(base + ' *').each((i, e) => {
    let root = getRoot(e, baseView);
    if (root) {
      roots.add(root);
    }
  });

  return Array.from(roots);
};

let reloadPage = function(base='body') {
  getRoots(base).forEach(view => view.rerender());
};

export {reloadPage};
