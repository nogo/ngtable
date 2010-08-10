/*
 * jQuery ngtable.pager
 *
 * @author Danilo Kuehn <kuehn@nogo-software.de>
 * @license MIT
 * @copyright 2010, Danilo Kuehn
 *
 * @source http://www.packtpub.com/article/jquery-table-manipulation-pa
 *
 * @param jQueryObject container, element where pager controls will be included
 * @param Integer show, amount of rows to shown on page, default: 10
 * @param Integer page, start page, default: 1
 * @param Object css, define used css classes for markup
 * @param Object text, define text for prev- and next-button, you can use html markup too
 *
 * Example:
 *  minimal:
 *  $('table').ngtablepager({container: jQuery("#pager")});
 *
 *  all options:
 *  $('table').ngtablepager({
 *    container: jQuery("#pager"),
 *    show: 10,
 *    page: 1,
 *    css: {
 *      'next': 'button-next',
 *      'prev': 'button-prev',
 *      'page': 'page',
 *      'current': 'page-active'
 *    },
 *    text: {
 *      'next': 'Next',
 *      'prev': 'Prev'
 *    }
 *  });
 *
 */

(function($, window) {

	$.fn.ngtablepager = function(settings){
		var moveTo = function($table, $rows, opt) {

			var total = $rows.length, show = parseInt(opt.show),
			totalPages = Math.ceil(total / show),
			offsetLeft = (opt.page - 1) * show,
			offsetRight = offsetLeft + show;
			offsetRight = ((offsetRight >= total) ? total : offsetRight);

			var $prev = $('.' + opt.css.prev, opt.container),
			$next = $('.' + opt.css.next, opt.container),
			$activePage = $('.' + opt.css.current, opt.container);

			$rows.hide();
			for (var i=offsetLeft; i<offsetRight; i++) {
				$($rows[i]).show();
			}

			// show buttons
			$prev.hide();
			$next.hide();
			if (opt.page > 1) {
				$prev.show();
			}
			if (opt.page < totalPages) {
				$next.show();
			}

			// remove active page
			$activePage.attr('href', '#page-' + $activePage.attr('rel')).removeClass(opt.css.current);

			// set current page
			$(['.', opt.css.page, '[rel=', opt.page ,']'].join(''), opt.container).removeAttr('href').addClass(opt.css.current);
		},
		build = function($table, $rows, opt) {
			$table.trigger('before-pager-build');
			var totalPages = Math.ceil($rows.length / opt.show),
			$pager = $table.next('#' + opt.css.pager);

			if (!$pager.length) {
				$pager = $('<div id="'+ opt.css.pager +'"></div>');
				$table.after($pager);
			}
			$pager.empty();

			if ($pager && totalPages > 1 && opt.visible) {
				// adding pages and buttons to pager container
				$pager.append($(['<a class="', opt.css.prev, '" href="#page-prev">', opt.text.prev, '</a>'].join('')).click(function() {
					if (opt.page <= 1) {
						opt.page = 1;
					} else {
						opt.page--;
					}
					moveTo($table, $rows, opt);
					return false;
				}));

				for (var i=1; i<=totalPages; i++) {
					$pager.append($(['<a id="', opt.css.page, '-', i, '" class="', opt.css.page,'" href="#page-', i,'" rel="', i, '">', i,'</a>'].join('')).click(function() {
						opt.page = $(this).attr('rel');
						if (opt.page >= totalPages){
							opt.page = totalPages;
						} else if (opt.page <= 1){
							opt.page = 1;
						}
						moveTo($table, $rows, opt);
						return false;
					}));
				}
				$pager.append($(['<a class="', opt.css.next, '" href="#page-next">', opt.text.next, '</a>'].join('')).click(function() {
					if (opt.page >= totalPages) {
						opt.page = totalPages;
					} else {
						opt.page++;
					}
					moveTo($table, $rows, opt);
					return false;
				}));
			}
			$table.trigger('after-pager-build');
		};

		$(this).each(function() {
			var $table 		= $(this),
			config 		= $.extend(true, {
				show: 10,
				page: 1,
				visible: true,
				css: {
					'pager': 'table-pager',
					'next': 'button-next',
					'prev': 'button-prev',
					'page': 'page',
					'current': 'page-active'
				},
				text: {
					'next': 'Next',
					'prev': 'Prev'
				}
			}, settings);


			$table.trigger('before-pager');

			var $rows = $('tbody tr:visible', $table);

			build($table, $rows, config);
			moveTo($table, $rows, config);
			$('tbody', $table).show();

			$table.trigger('after-pager');


			$('tbody', $table).bind('change', function(e) {
				$table.trigger('before-pager');

				config.page = 1;
				var $rows = $('tbody tr:visible', $table);

				build($table, $rows, config);
				moveTo($table, $rows, config);

				$table.trigger('after-pager');
			});
		});

		return $(this);
	};
})(jQuery, window);
