/*
 * jQuery ngtable.search
 *
 * @author Danilo Kuehn <kuehn@nogo-software.de>
 * @license MIT
 * @copyright 2010, Danilo Kuehn
 *
 * @source http://www.packtpub.com/article/jquery-table-manipulation-pae>
 *
 * Example:
 *   $('button').click(function(){
 *     $('table tbody tr').ngngtablesearch({
 *      search: $('.inputtext').val()
 *     });
 *   })
 *
 *   Options:
 *   {
 *     css: {
 *       'search': 'search',
 *       'filter-fail': 'tablesorter-filter-fail'
 *     },
 *     search: undefined
 *   }
 *
 * @param Object css, define used css classes for markup
 * @param String search, contain search text and will be searched in table
 */

(function($) {

  // jquery extension for :contains, will ignore case
  $.expr[':'].Contains = function(a,i,m){
    return (a.textContent || a.innerText || "").toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
  };

  $.fn.ngtablesearch = function(settings) {
    var config = $.extend(true, {
      css: {
        'search': 'search',
        'filter-fail': 'tablesorter-filter-fail'
      },
      search: undefined
    }, settings);

    $(this).each(function() {
      var $table = $(this),
          $elements = $table.data('ngtable.search'),
          rowIdx = [],
          search = (config && config.search) ? config.search : undefined;

      if (!$elements) {
        // get row indexes
        $('th.' + config.css['search'], $table).each(function() {
          rowIdx[rowIdx.length] = this.cellIndex+1;
        });

        $elements = (rowIdx.length > 0) ? $('tbody tr td:nth-child(' + rowIdx.join('|') + ')', $table) : $('tbody tr td', $table);
        $table.data('ngtable.search', $elements);
      }
      
      if (search && search != '') {
        // if search not match with td data then set fail-filter class
        // selector make show that only this column will be checked
        $elements.each(function() {
          var item = $(this);
          if (item.text().toLowerCase().indexOf(search.toLowerCase()) < 0) {
            item.addClass(config.css['filter-fail']);
          } else {
            item.removeClass(config.css['filter-fail']);
          }
        });
      } else {
        $elements.removeClass(config.css['filter-fail']);
      }

      // filter all fail-filter classes
      $table.trigger('filter');
    });
  };
})(jQuery);
