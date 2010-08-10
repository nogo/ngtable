/*
 * jQuery ngtable.sorter
 *
 * @author Danilo Kuehn <kuehn@nogo-software.de>
 * @license MIT
 * @copyright 2010, Danilo Kuehn
 *
 * @source http://www.packtpub.com/article/jquery-table-manipulation-part1
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
      actions: {
        'before': function() {},
        'after': function() {}
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
              var search = $(this).val(),
              $elements = $('tbody tr td:nth-child('+(idx+1)+')', $table);

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
            var idx = $cell[0].cellIndex,
            id = 'cell-' + idx;
            var optionsAdded = [],
            addOption = function(value, options) {
              options = options || [];
              value = $.trim(value);
              if (value != '' && $.inArray(value, options) < 0) {
                options[options.length] = value;
              }
              return options;
            },
            updateSelect = function(select, options) {
              if (select && options) {
                $options = select.children('[value!=all]');
                $options.removeAttr('disabled');
                var option;

                for (var i=0; i<$options.length; i++) {
                  option = $($options[i]);
                  if ($.inArray(option.val(), options) < 0) {
                    option.attr('disabled','disabled');
                  }
                }
              }
            };

            $('tbody tr td:nth-child('+(idx+1)+')', $table).each(function(obj, item){
              optionsAdded = addOption($(item).text(), optionsAdded);
            });

            if (optionsAdded.length > 1) {
              optionsAdded.sort();
              var options = ['<option value="all">ausw&auml;hlen</option>'];
              for (var i=0; i<optionsAdded.length; i++) {
                options[options.length] = ['<option value="', optionsAdded[i], '">', optionsAdded[i], '</option>'].join('');
              }

              var select = $(['<select id="', id ,'">', options.join("\n"), '</select>'].join('')).change(function() {
                var search = $('#' + id).val(),
                $elements = $('tbody tr td:nth-child('+(idx+1)+')', $table);

                if (search == 'all') {
                  // if search empty remove all fail-filter classes from the td-element
                  // selector make show that only this column will be checked
                  $elements.each(function() {
                    $(this).removeClass(config.css['filter-fail']);
                  });
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
                var options = [],
                    select = $(this),
                    val = select.val();
                $('tbody tr:visible td:nth-child('+(idx+1)+')', $table).each(function(obj, item){
                  options = addOption($(item).text(), options);
                });

                updateSelect(select, options, val);
              }).appendTo($cell);
            }
          }
        },
        sorter: {
          'sort-alpha': function($cell, order) {
            return $cell.find('.sort-key').text().toUpperCase() + ' ' + $cell.text().toUpperCase();
          },
          'sort-numeric': function($cell, order) {
            var key = parseFloat($cell.text());
            return isNaN(key) ? 0 : key;
          },
          'sort-date':  function($cell, order) {
            var text = $.trim($cell.text());
            var date = Date.parse(text.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1"));
            if (isNaN(date)) {
              date = Date.parse(Date());
            }
            return date;
          }
        }
      }
    }, settings);

    var sort = function($th, $table, config) {
      var data = $th.data('tablesorter'),
          thIdx = $th[0].cellIndex;

      if (config.plugins.sorter && config.plugins.sorter[data.sorter]) {
        var rows = $table.find('tbody > tr').get(),
            order = ($th.is('.' + config.css.asc))  ? -1 : 1,
            sortKeyFunc = config.plugins.sorter[data.sorter];

        $table.trigger('before-sort');

        $.each(rows, function(index, row) {
          row.sortKey = sortKeyFunc($(row).children('td').eq(thIdx), order);
        });

        // array sort for rows
        rows.sort(function(a, b) {
          if (a.sortKey < b.sortKey) return order;
          if (a.sortKey > b.sortKey) return -order;
          return 0;
        });

        // append all rows to tbody of table
        $.each(rows, function(index, row) {
          $table.children('tbody').append(row);
          row.sortKey = null;
        });

        $(rows).show();

        // remove sort order classes from all th
        $('thead th', $table).removeClass([config.css.asc, config.css.desc].join(' '));

        // add sort order class to clicked th
        $th.addClass(((order == -1) ? config.css.asc : config.css.desc));

        $table.trigger('after-sort');
        $table.trigger('filter');
      }
    }

    $(this).each(function() {
      var $table = $(this);

      $table.trigger('before');
      if (config.actions.before) {
        config.actions.before();
      }

      // bind filter event to table
      $table.bind('filter', function(e) {
        $table.trigger('before-filter');
        $('tbody tr:hidden', $table).show();

        $('tbody tr', $table).filter(function() {
          return $('td.' + config.css['filter-fail'], this).length;
        }).hide();

        $('thead select', $table).trigger('update-filter');

        $('tbody', $table).trigger('change');
        $table.trigger('after-filter');
      });

      // bind change event to table
      $('tbody', $table).bind('change', function() {
        // run colorize on tbody change
        if (config.plugins.colorize) {
          config.plugins.colorize($table, config);
        }
      });

      $table.find('th').each(function(column) {
        var findSortKey = undefined,
            $th = $(this);

        if (config && config.plugins && config.plugins.sorter) {
          for (var name in config.plugins.sorter) if (config.plugins.sorter.hasOwnProperty(name)) {
            if ($th.is('.' + name)) {
              $th.data('tablesorter', {
                sorter: name
              });

              findSortKey = config.plugins.sorter[name];
              var hashName = ['#', name, '-', 'cell-', column+1].join(''),
                  classes = (config.css.history) ? [config.css.clickable, config.css.history, ].join(' ') : config.css.clickable;

              var element = $('span', $th);
              if (element.length > 0) {
                element.wrap(['<a class="', classes, '" href="', hashName, '" rel="nofollow"></a>'].join(''));
              } else {
                $th.wrapInner(['<a class="', classes, '" href="', hashName, '" rel="nofollow"></a>'].join(''));
              }
              break;
            }
          }
        }

        if (findSortKey) {
          // bind sort event
          $th.bind('sort', function(e) {
            sort($th, $table, config);
          });

          // add click event to clickable elements
          $('.' + config.css.clickable, $th).click(function() {
            // get current order
            var order = ($th.is('.' + config.css.asc))  ? -1 : 1;

            // remove sort order classes from all th
            $('thead th', $table).removeClass([config.css.asc, config.css.desc].join(' '));

            // add sort order class to clicked th
            $th.addClass(((order == 1) ? config.css.asc : config.css.desc));

            sort($th, $table, config);
            return false;
          });

          //do css preconfigured sorting
          if ($th.is(['.' + config.css.asc, '.' + config.css.desc].join(','))) {
            $th.trigger('sort');
          }
        }

        if (config && config.plugins && config.plugins.filter) {
          for (var name in config.plugins.filter) if (config.plugins.filter.hasOwnProperty(name)) {
            if ($th.is('.' + name)) {
              config.plugins.filter[name]($th, $table, config);
            }
          }
        }

        $table.trigger('filter');
      });

      if (config.actions.after) {
        config.actions.after();
      }
    });

    return $(this);
  };
})(jQuery, window);
