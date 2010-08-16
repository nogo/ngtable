/*
 * jQuery ngtable.sorter
 *
 * @author Danilo Kuehn <kuehn@nogo-software.de>
 * @license MIT
 * @copyright 2010, Danilo Kuehn
 *
 * @source http://www.packtpub.com/article/jquery-table-manipulation-part1
 *
 * @version
 * 0.2 code optimization
 * 0.1 rewrite tablesorter core
 *
 * @param Object css, define used css classes for markup
 * @param Object plugins, override or define custom filter and sorter
 *
 * Example:
 *  minimal:
 *  $('table').ngtablesorter();
 *
 *  all options:
 *  $('table').ngtablesorter({
 *    css: {
 *      'asc': 'tablesorter-asc',
 *      'desc': 'tablesorter-desc',
 *      'even': 'tablesorter-even',
 *      'odd': 'tablesorter-odd',
 *      'hover': 'tablesorter-hover',
 *      'sorted': 'tablesorter-sorted',
 *      'clickable': 'tablesorter-clickable',
 *      'filter-fail': 'tablesorter-filter-fail'
 *    },
 *    plugins: {
 *      filter: {
 *        'filter-input': function ($cell, $table, config) {},
 *        'filter-select': function($cell, $table, config) {},
 *      sorter: {
 *        'sort-alpha': function($cell, order) {},
 *        'sort-numeric': function($cell, order) {},
 *        'sort-date':  function($cell, order) {},
 *        'sort-duration':  function($cell, order) {}
 *      }
 *    }
 *  });
 *
 *  extend or override filter and sorter plugins:
 *  $('table').ngtablesorter({
 *    plugins: {
 *      filter: {
 *        //'classname': function(TH, TABLE, config)
 *        'new-filter': function($cell, $table, config) {
 *          // DO SOME FILTER STUFF
 *          $('<input />').event(funtion() {
 *            // tigger filter event at the end
 *            $table.trigger('filter');
 *          }).appendTo($cell);
 *        }
 *      }
 *      sorter: {
 *        //'classname': function(TH, order[1|-1])
 *        'new-sorter': function($cell, order) {
 *          // DO SOME SORT STUFF
 *          // return should be a number to compare each cell
 *        }
 *      }
 *    }
 *  });
 */

(function($, window) {

  $.expr[':'].Contains = function(a,i,m){
    return (a.textContent || a.innerText || "").toLowerCase().indexOf(m[3].toLowerCase()) >= 0;
  };

  $.fn.ngtablesorter = function(settings) {
    var config = $.extend(true, {
      css: {
        'asc': 'tablesorter-asc',
        'desc': 'tablesorter-desc',
        'even': 'tablesorter-even',
        'odd': 'tablesorter-odd',
        'hover': 'tablesorter-hover',
        'sorted': 'tablesorter-sorted',
        'clickable': 'tablesorter-clickable',
        'filter-fail': 'tablesorter-filter-fail',
        'hidden': 'tablesorter-hidden'
      },
      plugins: {
        colorize: function ($table, config) {
          $("tbody tr", $table).removeClass([config.css['even'], config.css['odd']].join(' '));

          $("tbody tr:visible:even", $table).addClass(config.css['even']);
          $("tbody tr:visible:odd", $table).addClass(config.css['odd']);
        },
        filter: {
          'filter-input': function ($cell, $table, config) {
            var idx = $cell[0].cellIndex,
            id = 'cell-' + idx;
            // generate input field and add event and append it to $cell
            $(['<input type="text" id="', id ,'" />'].join('')).keyup(function() {
              var $input = $(this),
              search = $input.val(),
              $elements = $input.data('elements');

              if (!$elements) {
                $elements = $('tbody tr td:nth-child('+(idx+1)+')', $table);
                $input.data('elements', $elements);
              }

              if (search == '') {
                // if search empty remove all fail-filter classes from the td-element
                // selector make show that only this column will be checked
                $elements.each(function() {
                  $(this).removeClass(config.css['filter-fail']);
                });
              } else {
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
              }
              // filter all fail-filter classes
              $table.trigger('filter');
            }).appendTo($cell);
          },
          'filter-select': function($cell, $table, config) {
            var $elements = $cell.data('elements'),
                idx = $cell[0].cellIndex,
                id = 'cell-' + idx,
                optionsAdded = [],
                addOption = function(value, options) {
                  options = options || [];
                  value = $.trim(value);
                  if (value != '' && $.inArray(value, options) < 0) {
                    options[options.length] = value;
                  }
                  return options;
                };

            if (!$elements) {
              $elements = $('tbody tr td:nth-child('+(idx+1)+')', $table);
              $cell.data('elements', $elements);
            }

            $elements.each(function(obj, item){
              optionsAdded = addOption($(item).text(), optionsAdded);
            });

            if (optionsAdded.length > 1) {
              optionsAdded.sort();
              var options = ['<option value="all">ausw&auml;hlen</option>'];
              for (var i=0; i<optionsAdded.length; i++) {
                options[options.length] = ['<option value="', optionsAdded[i], '">', optionsAdded[i], '</option>'].join('');
              }

              $(['<select id="', id ,'">', options.join("\n"), '</select>'].join('')).change(function() {
                var search = $('#' + id).val();

                if (search == 'all') {
                  // if search empty remove all fail-filter classes from the td-element
                  // selector make show that only this column will be checked
                  $elements.removeClass(config.css['filter-fail']);
                } else {
                  // if search not match with td data then set fail-filter class
                  // selector make show that only this column will be checked
                  $elements.each(function() {
                    var item = $(this),
                    text = $.trim(item.text());
                    if (text != search) {
                      item.addClass(config.css['filter-fail']);
                    } else {
                      item.removeClass(config.css['filter-fail']);
                    }
                  });
                }

                $table.trigger('filter');
              }).bind('update-filter', function() {
                var $select = $(this),
                    options = [],
                    $options = $select.children('[value!=all]').removeAttr('disabled');

                $elements.each(function(obj, item){
                  var $item = $(item);
                  if (!$item.hasClass(config.css['filter-fail'])) {
                    options = addOption($item.text(), options);
                  }
                });

                $options.each(function() {
                  var $option = $(this);
                  if ($.inArray($option.val(), options) < 0) {
                    $option.attr('disabled','disabled');
                  }
                });
              }).appendTo($cell);
            }
          }
        },
        sorter: {
          'sort-alpha': function($cell, order) {
            var text = '',
            sortkeys = $('.sort-key', $cell);

            if (sortkeys.length) {
              sortkeys.each(function(){
                text += ' ' + $.trim(this).toUpperCase()
              });
            } else {
              text = $.trim($cell.text()).toUpperCase();
            }

            return text;
          },
          'sort-numeric': function($cell, order) {
            var text = $.trim($cell.text()), key = parseFloat(text);
            return isNaN(key) ? 0 : key;
          },
          'sort-date':  function($cell, order) {
            var text = $.trim($cell.text());
            var date = Date.parse(text);
            if (isNaN(date)) {
              date = Date.parse(Date());
            }
            return date;
          }
        }
      }
    }, settings);

    /*
     * sort function
     */
    var sort = function($th, $table, config) {
      var sorter = $th.data('ngtable.sorter'),
          thIdx = $th[0].cellIndex;

      if (config.plugins.sorter && config.plugins.sorter[sorter]) {
        var rows = $('tbody tr', $table).detach().get(),
        order = ($th.is('.' + config.css.asc))  ? -1 : 1,
        sortKeyFunc = config.plugins.sorter[sorter];

        $table.trigger('before-sort');

        for (var i=0; i<rows.length; i++) {
          rows[i].sortKey = sortKeyFunc($('td', rows[i]).eq(thIdx), order);
        }

        rows.sort(function(a, b) {          
          if (a.sortKey < b.sortKey) return order;
          if (a.sortKey > b.sortKey) return -order;
          return 0;
        });

        $(rows).css('display', '');

        // remove sort order classes from all th
        $('thead th', $table).removeClass([config.css.asc, config.css.desc].join(' '));

        // add sort order class to clicked th
        $th.addClass(((order == -1) ? config.css.asc : config.css.desc));

        // append all rows to tbody of table
        $('tbody', $table).append(rows);

        $table.trigger('after-sort');
        $table.trigger('filter');
      }
    }

    $(this).each(function() {
      var $table = $(this),
      $thead = $('thead th', $table);

      $table.trigger('before');

      // bind filter event to table
      $table.bind('filter', function(e) {
        var $table = $(this),
        $tbody = $('tbody', $table);
        
        $table.trigger('before-filter');

        var $tr = $('tr', $tbody).detach();

        $tr.filter(':hidden').css('display', '');
        $tr.filter(function() {
          return $('td.' + config.css['filter-fail'], this).length;
        }).css('display', 'none');

        $tbody.append($tr);
        
        $('thead select', $table).trigger('update-filter');
        $tbody.trigger('change');

        $table.trigger('after-filter');
      });

      // bind change event to table
      $('tbody', $table).bind('change', function() {
        // run colorize on tbody change
        if (config.plugins.colorize) {
          config.plugins.colorize($table, config);
        }
      });

      $thead.each(function(column) {
        var findSortKey = undefined,
        $th = $(this),
        thClass = $th.attr('class').split(' ');

        if (thClass && thClass.length > 0) {
          if (config && config.plugins) {
            for (var i=0; i<thClass.length; i++) {
              // set sort function
              if (!findSortKey && config.plugins.sorter && config.plugins.sorter[thClass[i]]) {
                findSortKey = config.plugins.sorter[thClass[i]];
                $th.data('ngtable.sorter', thClass[i]);
                
                var hashName = ['#', thClass[i], '-', 'cell-', column+1].join(''),
                aClass = (config.css.history) ? [config.css.clickable, config.css.history, ].join(' ') : config.css.clickable;

                var element = $('span', $th);
                if (element.length > 0) {
                  element.wrap(['<a class="', aClass, '" href="', hashName, '" rel="nofollow"></a>'].join(''));
                } else {
                  $th.wrapInner(['<a class="', aClass, '" href="', hashName, '" rel="nofollow"></a>'].join(''));
                }
              }

              // generate filter
              if (config.plugins.filter && config.plugins.filter[thClass[i]]) {
                config.plugins.filter[thClass[i]]($th, $table, config);
              }
            }
          }
        }

        if (findSortKey) {
          // add click event to clickable elements
          $('.' + config.css.clickable, $th).click(function() {
            // get current order
            var order = ($th.is('.' + config.css.asc))  ? -1 : 1;

            // remove sort order classes from all th
            $thead.removeClass([config.css.asc, config.css.desc].join(' '));

            // add sort order class to clicked th
            $th.addClass(((order == 1) ? config.css.asc : config.css.desc));

            sort($th, $table, config);
            return false;
          });

          // bind sort event
          $th.bind('sort', function(e) {
            sort($th, $table, config);
          });

          //do css preconfigured sorting
          if ($th.is(['.' + config.css.asc, '.' + config.css.desc].join(','))) {
            $th.trigger('sort');
          }
        }
      });

      // run after sort event
      $table.trigger('after');

      // trigger filter
      $table.trigger('filter');
    }); // end each $(this)

    return $(this);
  };
})(jQuery, window);
