var PROXY_HOST = "r.shadowsee.icu";
var PROTOCOL = "https:";
var OLD_HOST = "r.iirose.com";

function replaceUrl(url) {
  if (!url || typeof url !== "string") return url;
  return url.replace(
    new RegExp("https?://" + OLD_HOST.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
    PROTOCOL + "//" + PROXY_HOST
  );
}

function processElement(el) {
  var attrs = ["src", "href", "data-src", "data-original", "data-lazy-src", "srcset"];
  attrs.forEach(function(attr) {
    if (el.hasAttribute(attr)) {
      var val = el.getAttribute(attr);
      var replaced = replaceUrl(val);
      if (replaced !== val) {
        el.setAttribute(attr, replaced);
      }
    }
  });

  if (el.style && el.style.backgroundImage) {
    el.style.backgroundImage = replaceUrl(el.style.backgroundImage);
  }
}

function processTextNodes(root) {
  if (!root) root = document.body;
  if (!root) return;

  var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  var nodesToReplace = [];
  while (treeWalker.nextNode()) {
    var node = treeWalker.currentNode;
    if (node.textContent && node.textContent.indexOf(OLD_HOST) !== -1) {
      nodesToReplace.push(node);
    }
  }

  nodesToReplace.forEach(function(node) {
    var parent = node.parentNode;
    if (!parent) return;
    if (parent.nodeName === "SCRIPT" || parent.nodeName === "STYLE") return;
    var replaced = replaceUrl(node.textContent);
    if (replaced !== node.textContent) {
      node.textContent = replaced;
    }
  });
}

function scanDocument(root) {
  if (!root) root = document;
  var elements = root.querySelectorAll("*");
  elements.forEach(processElement);
  processTextNodes(root);
}

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node) {
      if (node.nodeType === 1) {
        processElement(node);
        if (node.querySelectorAll) {
          node.querySelectorAll("*").forEach(processElement);
        }
      }
    });
  });
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() {
    scanDocument();
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
} else {
  scanDocument();
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
}
