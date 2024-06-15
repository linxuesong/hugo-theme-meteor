(function ($, CONFIG) {
  var $main = $('.ins-search');
  var $input = $main.find('.ins-search-input');
  var $wrapper = $main.find('.ins-section-wrapper');
  var $container = $main.find('.ins-section-container');
  var $postSection = $main.find('#post_hits') 
  $main.parent().remove('.ins-search');
  $('body').append($main);


// 使用algolia官方js提供的方法完善搜索框，详细使用方式见https://www.algolia.com/doc/ui-libraries/autocomplete/introduction/getting-started/

// // 这个是自己手动创建，构建搜索客户端，替换成自己的algolia信息
// autocomplete已经替我们完成了
// var client = algoliasearch();
// // 我们之后可以使用index对象对这个索引库进行CURD操作，search,add等
// var index = client.initIndex(mashiro_option.search.algolia.indexName);


const appId =  mashiro_option.search.algolia.appId;
const apiKey =  mashiro_option.search.algolia.apiKey;
const indexName =  mashiro_option.search.algolia.indexName;
const  perPage = mashiro_option.search.algolia.perPage;
const  placeholder = mashiro_option.search.algolia.placeholder;


const renderHits = (renderOptions, isFirstRender) => {
  // Rendering logic
};

// 2. Create the custom widget
const customHits = instantsearch.connectors.connectHits(
  renderHits
);


// instantsearch函数相关参数 见https://www.algolia.com/doc/api-reference/widgets/instantsearch/js
const search = instantsearch({
  indexName,
  searchClient: algoliasearch(appId, apiKey),
  searchFunction: helper => { //用于控制搜索行为,这里是当搜索框有值时才搜索
    if (document.querySelector('.ins-search-input').value) {
      helper.search();
    }
  }
});

// Registering Widgets
search.addWidgets([
  instantsearch.widgets.configure({
    hitsPerPage: perPage || 20
  }),

  // 搜索框
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: placeholder,
    // Hide default icons of algolia search
    showReset: false, // 显示一些按钮
    showSubmit: false,
    showLoadingIndicator: true,
    searchAsYouType: false, // 随着输入自动搜索
    cssClasses: {
      input: 'ins-search-input'
    }
  }),

  // instantsearch.widgets.stats({
  //   container: '.algolia-stats',
  //   templates: {
  //     text: data => {
  //       const stats = '搜索时间' // NexT.CONFIG.i18n.hits_time
  //         .replace('${hits}', data.nbHits)
  //         .replace('${time}', data.processingTimeMS);
  //       return `${stats}`;
  //     }
  //   },
  //   cssClasses: {
  //     text: 'search-stats'
  //   }
  // }),


  // 搜索结果
  instantsearch.widgets.hits({
    container: '#post_hits',
    escapeHTML: true,
    templates: {
      item(hit, { html, components }) { // components包含highlight、snipeet等方法
        return html`
          <a href="${hit.permalink}" class="ins-search-item-link">
            <header><i class="fa fa-file"></i>${components.Highlight({ attribute: 'title', hit })}</header>
            <p class="ins-search-preview">${components.Snippet({ attribute: 'contents', hit })}</p>
          </a>
        `;
      },
      empty(results, { html }) {
        return html`No results for <q>${results.query}</q>`;
      },
    },
    cssClasses: {
      root: 'ins-section',
      list: 'search-result-list',
      item: ['ins-selectable', 'ins-search-item']
    }
  }),




  // 分页器
  // instantsearch.widgets.pagination({
  //   container: '.algolia-pagination',
  //   scrollTo: false,
  //   showFirst: true,
  //   showLast: true,
  //   templates: {
  //     first: '<i class="fa fa-angle-double-left"></i>',
  //     last: '<i class="fa fa-angle-double-right"></i>',
  //     previous: '<i class="fa fa-angle-left"></i>',
  //     next: '<i class="fa fa-angle-right"></i>'
  //   },
  //   cssClasses: {
  //     list: ['pagination', 'algolia-pagination'],
  //     item: 'pagination-item',
  //     link: 'page-number',
  //     selectedItem: 'current',
  //     disabledItem: 'disabled-item'
  //   }
  // })
]);

search.start();


  // 1.返回的json文件拿到
  $.getJSON(CONFIG.CONTENT_URL, function (json) {
      if (location.hash.trim() === '#ins-search') {
          $main.addClass('show');
      }
  });


  // 2.搜索按钮弹窗 键盘操作
  $(document).on('click focus', '.search-field', function () {
      $main.addClass('show');
      $main.find('.ins-search-input').focus();
  }).on('click focus', '.search-form-submit', function () {
      $main.addClass('show');
      $main.find('.ins-search-input').focus();
  }).on('click', '.ins-search-item', function () {
      gotoLink($(this));
  }).on('click', '.ins-close', function () {
      $main.removeClass('show');
  }).on('keydown', function (e) {
      if (!$main.hasClass('show')) return;
      switch (e.keyCode) {
          case 27: // ESC
              $main.removeClass('show'); break;
          case 38: // UP
              selectItemByDiff(-1); break;
          case 40: // DOWN
              selectItemByDiff(1); break;
          case 13: //ENTER
              gotoLink($container.find('.ins-selectable.active').eq(0).find('.ins-search-item-link').eq(0)); break; // 找到搜索条目下选中的的引用
          default:
              cancelSelect($container.find('.ins-selectable.active').eq(0).find('.ins-search-item-link').eq(0));
              $main.find('.ins-search-input').focus();
      }
  });


// 再次输入时取消选中
function cancelSelect (value) {
  var $items = $.makeArray($container.find('.ins-selectable'));
  $items.forEach(function (item, index) {
      if ($(item).hasClass('active')) {
        $(item).removeClass('active')
          return;
      }
  });
}

// 键盘回车跳出
function gotoLink ($item) {
    if ($item && $item.length) {
        location.href = $item.attr('href');
    }
}

// 键盘移动时 右侧滚轮到相对位置
function scrollTo ($item) {
  if ($item.length === 0) return;
  var wrapperHeight = $wrapper[0].clientHeight;
  var itemTop = $item.position().top - $wrapper.scrollTop();
  var itemBottom = $item[0].clientHeight + $item.position().top;
  if (itemBottom > wrapperHeight + $wrapper.scrollTop()) {
      $wrapper.scrollTop(itemBottom - $wrapper[0].clientHeight);
  }
  if (itemTop < 0) {
      $wrapper.scrollTop($item.position().top);
  }
}


// 键盘上下相对移动
function selectItemByDiff (value) {
  var $items = $.makeArray($container.find('.ins-selectable'));
  var prevPosition = -1;
  $items.forEach(function (item, index) {
      if ($(item).hasClass('active')) {
          prevPosition = index;
          return;
      }
  });
  var nextPosition = ($items.length + prevPosition + value) % $items.length;
  $($items[prevPosition]).removeClass('active');
  $($items[nextPosition]).addClass('active');
  scrollTo($($items[nextPosition]));
}

})(jQuery, window.INSIGHT_CONFIG);


// <div class="ins-search-container">
//         <div class="ins-input-wrapper">
//             <input type="text" class="ins-search-input" placeholder="Type something...">
//             <span class="ins-close ins-selectable"><i class="fa fa-times-circle"></i></span>
//         </div>
//         <div class="ins-section-wrapper">
//             <div class="ins-section-container">
//               <section class="ins-section">
//               搜索类型Posts
//               <header class="ins-section-header">Posts</header>
//               搜索结果一
//               <div class="ins-selectable ins-search-item" data-url="/2021/11/12/hello-world/">
//                 <header><i class="fa fa-file"></i>Hello World</header>
//                 <p class="ins-search-preview">Welcome to Hexo! This is your very first post. Check documentation for more info. If you get any problems when using Hexo, you can find the answer in </p>
//               </div>

//         </div>
//     </div>
