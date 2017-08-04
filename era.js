(function(global, factory) {
	global.Era = factory()
}(window, function() {
	function Era(options) {
		let settings = {}

		function era(options) {
			let m = moment()
			let defaults = {
				calendar_type: 'days',
				number_of_months: 1,
				date_format: 'YYYY-MM-DD',
				ctrl_click: true,
				shift_click: true,
				moment: m,
				parent: null,
				handle: null,
				selected_dates: [],
				vertical_offset: 0,
				horizontal_offset: 0,
				shortcuts: true,
				year_dropdown_before: moment('2012', 'YYYY'),
				year_dropdown_after: m,
				on_select() {},
				on_open() {},
				on_close() {},
				on_destroy() {},
				select_event() {
					let dates = get_selected_dates()
					let evt = new CustomEvent('erajs-select', {detail: dates})
					settings.element.dispatchEvent(evt)
					settings.on_select(dates)
				},
				open_event() {
					let evt = new CustomEvent('erajs-open')
					settings.element.dispatchEvent(evt)
					settings.on_open()
				},
				close_event() {
					let evt = new CustomEvent('erajs-close')
					settings.element.dispatchEvent(evt)
					settings.on_close()
				},
				destroy_event() {
					let evt = new CustomEvent('erajs-destroy')
					settings.element.dispatchEvent(evt)
					settings.on_destroy()
				},
				custom_shortcuts: [],
				class_era: 'erajs-era_div',
				class_selected: 'erajs-selected_date',
				class_active: 'erajs-active',
				class_inactive: 'erajs-inactive',
				class_today_highlight: 'erajs-today_highlight',
				class_days: 'erajs-days',
				class_back_arrow: 'erajs-back_arrow',
				class_forward_arrow: 'erajs-forward_arrow',
				class_shortcuts: 'erajs-shortcuts',
				class_shortcuts_title: 'erajs-shortcuts_title',
				class_deselect_weekends: 'erajs-deselect_weekends',
				class_mtd: 'erajs-mtd',
				class_today: 'erajs-today',
				class_yesterday: 'erajs-yesterday',
				class_this_week: 'erajs-this_week',
				class_last_week: 'erajs-last_week',
				class_current_month: 'erajs-current_month',
				class_clear: 'erajs-clear',
				back_button: '&#9664;',
				forward_button: '&#9654;',
			}
			settings = Object.assign(defaults, options)
			render(m.clone())
			bind_selectors()
			bind_navigation()
			bind_shortcuts()

			return {
				destroy() {
					settings.element.innerHTML = ""
					settings.destroy_event()
					settings.handle.style.cursor = ''
				},
				get_dates() {
					return get_selected_dates()
				},
				set_dates(dates) {
					settings.selected_dates = clear_selection()
					if (dates) {
						for (let date of dates) {
							let selection = {date: date, last_clicked: false}
							settings.selected_dates.push(selection)
						}
					}
					change_selected()
					settings.select_event()
				},
				add_dates(dates) {
					for (let date of dates) {
						let date_exists = get_value_index('date', date) > -1
						if (!date_exists) {
							let selection = {date: date, last_clicked: false}
							settings.selected_dates.push(selection)
						}
					}
					change_selected()
					settings.select_event()
				},
				remove_dates(dates) {
					for (let date of dates) {
						let date_exists = get_value_index('date', date) > -1
						if (date_exists) {
							settings.selected_dates.splice(get_value_index('date', date), 1)
						}
					}
					change_selected()
					settings.select_event()
				},
				set_last_clicked_date(date, clear_dates = false) {
					if (clear_dates) {
						settings.selected_dates = clear_selection()
					}
					let existing_date = get_value_index('date', date)
					let last_clicked = get_value_index('last_clicked', true)
					if (last_clicked > -1) {
						settings.selected_dates[last_clicked].last_clicked = false
					}
					if (existing_date > -1) {
						settings.selected_dates[existing_date].last_clicked = true
					}
					else {
						let element = settings.parent.querySelector('[data-date="' + date.format(settings.date_format) + '"]')
						add_date(date, element)
					}
				},
				change_to_month(month, year = moment().year()) {
					if (is_number(month)) {
						month = String(month + 1)
					}
					if (month.length === 1) {
						month = '0' + month
					}
					year = String(year)
					let year_digits = ''
					for (let x = 0; x < year.length; x++) {
						year_digits += 'Y'
					}
					settings.moment = moment(year + month, year_digits + 'MM')
					render(settings.moment.clone())
					bind_selectors()
					bind_navigation(true)
					bind_shortcuts()
				},
				show() {
					settings.handle.style.cursor = ''
					settings.parent.style.display = ''
				},
				hide() {
					settings.handle.style.cursor = 'pointer'
					settings.parent.style.display = 'none'
				},
				options: settings
			}
		}

		function render(m) {
			if (settings.calendar_type === 'days') {
				render_days(m)
			}
			else if (settings.calendar_type === 'months') {
				render_months(m)
			}
			else if (settings.calendar_type === 'quarters') {
				render_quarters(m)
			}
		}

		function render_days(m) {
			settings.element.innerHTML = ''
			let today = moment()
			let div = tag_factory('div')
			let span = tag_factory('span')
			let tr = tag_factory('tr')
			let th = tag_factory('th')
			let td = tag_factory('td')
			let tables = []
			let labels = []
			for (let num = 0; num < settings.number_of_months; num++) {
				let month_name = m.format('MMMM')
				let year = m.format('YYYY')
				let days_in_month = m.endOf('month').date()
				let first_of_month_day = m.startOf('month').day()
				let days_in_last_month = m.subtract(1, 'months').endOf('month').date()
				let weekdays = moment.weekdaysShort()
				m.add(1, 'months')
				m.date(1)

				let ths = []
				let tds = []
				let trs = []
				let day = 1
				let active = cls(settings.class_active)
				let inactive_day = days_in_last_month - first_of_month_day + 1
				for (let x = 0; x <= 6; x++) {
					ths.push(th(weekdays[x]))
				}
				for (let x = 0; x < 6; x++) {
					tds = []
					for (let y = 0; y <= 6; y++) {
						if ((x === 0 && y >= first_of_month_day) || (x > 0 && day <= days_in_month)) {
							if (m.isSame(today, 'day')) {
								tds.push(td(div(day, cls(settings.class_days, settings.class_today_highlight)), active, {date: m.format(settings.date_format)}))
							}
							else {
								tds.push(td(div(day, cls(settings.class_days)), active, {date: m.format(settings.date_format)}))
							}
							day += 1
							m.add(1, 'days')
						}
						else {
							if (inactive_day > days_in_last_month) {
								inactive_day = 1
							}
							tds.push(td(div(inactive_day, cls(settings.class_inactive))))
							inactive_day += 1
						}
					}
					trs.push(tr(tds))
				}
				tables.push(tag('table', [tag('thead', tr(ths)), tag('tbody', trs)]))
				labels.push(month_name + ' ' + year)
			}

			let header = tag('h4', [
				div(settings.back_button, cls(settings.class_back_arrow)),
				labels.join(' - '),
				div(settings.forward_button, cls(settings.class_forward_arrow))
			])
			let footer = ''
			if (settings.shortcuts) {
				footer = div([
					div('Shortcuts', cls(settings.class_shortcuts_title)),
					span('Deselect Weekends', cls(settings.class_deselect_weekends)),
					span('MTD', cls(settings.class_mtd)),
					span('Today', cls(settings.class_today)),
					span('This Week', cls(settings.class_this_week)),
					span('Last Week', cls(settings.class_last_week)),
					span('Yesterday', cls(settings.class_yesterday)),
					span('Clear', cls(settings.class_clear)),
				], cls(settings.class_shortcuts))
			}
			let era_div = div([header, ...tables, footer], cls(settings.class_era))
			append_to_element(settings.element, era_div)
			settings.parent = settings.element.getElementsByClassName(settings.class_era).item(0)
		}

		function render_months(m) {
			settings.element.innerHTML = ''
			let today = moment()
			let div = tag_factory('div')
			let span = tag_factory('span')
			let tr = tag_factory('tr')
			let td = tag_factory('td')
			let option = tag_factory('option')
			let years = []
			let month_names = moment.monthsShort()
			while (settings.year_dropdown_before.isSameOrBefore(settings.year_dropdown_after)) {
				if (settings.year_dropdown_before.year() === today.year()) {
					years.push(option(settings.year_dropdown_before.format('YYYY'), {selected: null}))
				}
				else {
					years.push(option(settings.year_dropdown_before.format('YYYY')))
				}
				settings.year_dropdown_before.add(1, 'years')
			}
			let header = tag('h4', [
				span(settings.back_button, cls(settings.class_back_arrow)),
				tag('label', 'Year', {for: 'year_select'}),
				tag('select', years)
			])
			let table = tag('table', tag('tbody', [
				tr([td(month_names[0]), td(month_names[1]), td(month_names[2])]),
				tr([td(month_names[3]), td(month_names[4]), td(month_names[5])]),
				tr([td(month_names[6]), td(month_names[7]), td(month_names[8])]),
				tr([td(month_names[9]), td(month_names[10]), td(month_names[11])])
			]))
			let footer = div([
				div('Shortcuts', cls(settings.class_shortcuts_title)),
				span('Current Month', cls(settings.class_current_month)),
				span('Clear', cls(settings.class_clear)),
			], cls(settings.class_shortcuts))
			let era_div = div([header, table, footer], cls(settings.class_era))
			append_to_element(settings.element, era_div)
		}

		function render_quarters(m) {

		}

		function add_date(date, element = null) {
			if (element) {
				add_class(element, settings.class_selected)
			}
			for (let selected_date of settings.selected_dates) {
				selected_date.last_clicked = false
			}
			settings.selected_dates.push({date: date, last_clicked: true})
		}

		function remove_date(date, element = null) {
			if (element) {
				remove_class(element, settings.class_selected)
			}
			settings.selected_dates.splice(get_value_index('date', date), 1)
		}

		function bind_selectors() {
			let tds = settings.parent.querySelectorAll('.' + settings.class_active)
			for (let td of tds) {
				click(td, function(e) {
					if (e.ctrlKey && settings.ctrl_click) {
						ctrl_click(this)
					}
					else if (e.shiftKey && settings.shift_click) {
						shift_click(this)
					}
					else {
						settings.selected_dates = clear_selection()
						add_date(moment(data(this, 'date')), this)
					}
					settings.select_event()
				})
			}
		}

		function bind_navigation(handle_bound = false) {
			let back_button = settings.parent.getElementsByClassName(settings.class_back_arrow).item(0)
			let forward_button = settings.parent.getElementsByClassName(settings.class_forward_arrow).item(0)

			click(forward_button, function() {
				settings.moment = settings.moment.add(1, 'months')
				render(settings.moment.clone())
				bind_selectors()
				bind_navigation(true)
				bind_shortcuts()
				change_selected()
			})
			click(back_button, function() {
				settings.moment = settings.moment.subtract(1, 'months')
				render(settings.moment.clone())
				bind_selectors()
				bind_navigation(true)
				bind_shortcuts()
				change_selected()
			})
			if (settings.handle) {
				if (!handle_bound) {
					settings.handle.style.cursor = 'pointer'
					settings.parent.style.display = 'none'
				}
				click(settings.handle, function() {
					settings.handle.style.cursor = ''
					settings.parent.style.display = ''
					move_to_bottom_of_handle()
					if (!is_fully_on_screen()) {
						move_on_screen()
					}
					click_outside_close(function() {
						settings.handle.style.cursor = 'pointer'
						settings.close_event()
					})
					settings.open_event()
				})
				move_to_bottom_of_handle()
				if (!is_fully_on_screen()) {
					move_on_screen()
				}
				click_outside_close(function() {
					settings.handle.style.cursor = 'pointer'
				})
			}
			else {
				settings.parent.style.position = 'static'
			}
		}

		function bind_shortcuts() {
			let shortcut_div = settings.parent.getElementsByClassName(settings.class_shortcuts).item(0)
			let deselect_weekends = shortcut_div.getElementsByClassName(settings.class_deselect_weekends).item(0)
			let mtd = shortcut_div.getElementsByClassName(settings.class_mtd).item(0)
			let today_button = shortcut_div.getElementsByClassName(settings.class_today).item(0)
			let yesterday = shortcut_div.getElementsByClassName(settings.class_yesterday).item(0)
			let this_week = shortcut_div.getElementsByClassName(settings.class_this_week).item(0)
			let last_week = shortcut_div.getElementsByClassName(settings.class_last_week).item(0)
			let clear = shortcut_div.getElementsByClassName(settings.class_clear).item(0)
			click(deselect_weekends, function() {
				for (let key of Array.from(settings.selected_dates.keys()).reverse()) {
					let date = settings.selected_dates[key].date
					if (date.day() === 0 || date.day() === 6) {
						let element = settings.parent.querySelector('[data-date="' + date.format(settings.date_format) + '"]')
						remove_date(date, element)
					}
				}
				settings.select_event()
			})
			click(mtd, function(e) {
				let today = moment()
				settings.moment = today.clone()
				let start = moment().startOf('month')
				if (!(e.ctrlKey && settings.ctrl_click)) {
					settings.selected_dates = clear_selection()
				}
				while (start.isSameOrBefore(today, 'days')) {
					add_date(start.clone())
					start.add(1, 'days')
				}
				render(today)
				bind_selectors()
				bind_navigation(true)
				bind_shortcuts()
				change_selected()
				settings.select_event()
			})
			click(today_button, function(e) {
				let today = moment()
				settings.moment = today.clone()
				if (e.shiftKey && settings.shift_click) {
					let element = settings.parent.querySelector('[data-date="' + today.format(settings.date_format) + '"]')
					shift_click(element, null, today)
				}
				else if (!(e.ctrlKey && settings.ctrl_click)) {
					settings.selected_dates = clear_selection()
					add_date(today.clone())
				}
				else {
					add_date(today.clone())
				}
				render(today)
				bind_selectors()
				bind_navigation(true)
				bind_shortcuts()
				change_selected()
				settings.select_event()
			})
			click(yesterday, function(e) {
				let yest = moment().subtract(1, 'days')
				settings.moment = yest.clone()
				if (e.shiftKey && settings.shift_click) {
					let element = settings.parent.querySelector('[data-date="' + yest.format(settings.date_format) + '"]')
					shift_click(element, null, yest)
				}
				else if (!(e.ctrlKey && settings.ctrl_click)) {
					settings.selected_dates = clear_selection()
					add_date(yest.clone())
				}
				else {
					add_date(yest.clone())
				}
				render(yest)
				bind_selectors()
				bind_navigation(true)
				bind_shortcuts()
				change_selected()
				settings.select_event()
			})
			click(this_week, function(e) {
				let week_start = moment().startOf('week')
				settings.moment = week_start.clone()
				let week_end = moment().endOf('week')
				if (!(e.ctrlKey && settings.ctrl_click)) {
					settings.selected_dates = clear_selection()
				}
				while (week_start.isSameOrBefore(week_end, 'days')) {
					add_date(week_start.clone())
					week_start.add(1, 'days')
				}
				render(moment())
				bind_selectors()
				bind_navigation(true)
				bind_shortcuts()
				change_selected()
				settings.select_event()
			})
			click(last_week, function(e) {
				let week_start = moment().subtract(1, 'week').startOf('week')
				settings.moment = week_start.clone()
				let week_end = moment().subtract(1, 'week').endOf('week')
				if (!(e.ctrlKey && settings.ctrl_click)) {
					settings.selected_dates = clear_selection()
				}
				while (week_start.isSameOrBefore(week_end, 'days')) {
					add_date(week_start.clone())
					week_start.add(1, 'days')
				}
				render(week_start.startOf('week'))
				bind_selectors()
				bind_navigation(true)
				bind_shortcuts()
				change_selected()
				settings.select_event()
			})
			click(clear, function() {
				settings.selected_dates = clear_selection()
				change_selected()
				settings.select_event()
			})
			for (let shortcut of settings.custom_shortcuts) {
				let class_name = shortcut.class
				append_to_element(shortcut_div, tag('span', shortcut.label, cls(class_name)))
				let shortcut_element = shortcut_div.getElementsByClassName(class_name).item(0)
				click(shortcut_element, function(e) {
					let dates = shortcut.callback(settings, e)
					settings.selected_dates = clear_selection()
					for (let date of dates) {
						let element = settings.parent.querySelector('[data-date="' + date.format(settings.date_format) + '"]')
						add_date(date, element)
					}
					settings.moment = dates[0].clone()
					render(dates[0].clone())
					bind_selectors()
					bind_navigation(true)
					bind_shortcuts()
					change_selected()
					settings.select_event()
				})
			}
		}

		function ctrl_click(self) {
			if (has_class(self, settings.class_selected)) { //clicking an element already selected
				remove_date(moment(data(self, 'date')), self)
			}
			else {
				add_date(moment(data(self, 'date')), self)
			}
		}

		function shift_click(self, first_date = null, second_date = null) {
			let last_clicked = get_value_index('last_clicked', true)
			if (last_clicked > -1) { //a previous element has already been clicked
				let last_date = first_date ? first_date : settings.selected_dates[last_clicked].date
				let this_date = second_date ? second_date : moment(data(self, 'date'))
				settings.selected_dates = clear_selection()
				let earlier_date
				let later_date
				if (last_date.isAfter(this_date)) {
					earlier_date = this_date
					later_date = last_date
				}
				else {
					later_date = this_date
					earlier_date = last_date
				}
				let diff = later_date.diff(earlier_date, 'days')
				for (let x = 0; x <= diff; x++) {
					let element = settings.parent.querySelector('[data-date="' + earlier_date.format(settings.date_format) + '"]')
					add_date(earlier_date.clone(), element)
					earlier_date.add(1, 'days')
				}
			}
			else {
				add_date(moment(data(self, 'date')), self)
			}
		}

		// Utility functions
		function is_array(val) {
			return val instanceof Array
		}

		function is_HTMLCollection(val) {
			return val instanceof HTMLCollection
		}

		function is_number(val) {
			return val instanceof Number
		}

		function is_object(val) {
			if (val === null) {
				return false
			}
			return ((typeof val === 'function') || (typeof val === 'object'));
		}

		function get_selected_dates() {
			let dates = []
			for (let date of settings.selected_dates) {
				dates.push(date.date)
			}
			dates = dates.sort(function(a, b) {
				return a - b
			})
			return dates
		}

		function click_outside_close(callback) {
			add_event(document, 'mouseup', function close(e) {
				if (settings.parent !== e.target && !settings.parent.contains(e.target)) {
					settings.parent.style.display = 'none'
					if (typeof callback === 'function') {
						callback()
					}
					remove_event(document, 'mouseup', close)
				}
			})
		}

		function is_fully_on_screen() {
			let rect = settings.parent.getBoundingClientRect()
			return rect.top > 0 &&
				rect.left > 0 &&
				rect.bottom < window.innerHeight &&
				rect.right < window.innerWidth
		}

		function on_screen_offset() {
			let offsets = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0
			}
			let rect = settings.parent.getBoundingClientRect()
			if (rect.top < 0) {
				offsets.top = 0 - rect.top
			}
			if (rect.left < 0) {
				offsets.left = 0 - rect.left
			}
			if (rect.bottom > window.innerHeight) {
				offsets.bottom = window.innerHeight - rect.bottom
			}
			if (rect.right > window.innerWidth) {
				offsets.right = window.innerWidth - rect.right
			}
			return offsets
		}

		function move_on_screen() {
			let offsets = on_screen_offset()
			if (offsets.left) {
				settings.parent.style.transform = 'translateX(' + (-offsets.left) + 'px)'
			}
			if (offsets.right) {
				settings.parent.style.transform = 'translateX(' + offsets.right + 'px)'
			}
		}

		function move_to_bottom_of_handle() {
			let offsets = settings.handle.getBoundingClientRect()
			settings.parent.style.top = (offsets.bottom + settings.vertical_offset) + 'px'
			settings.parent.style.left = (offsets.left + settings.horizontal_offset) + 'px'
		}

		function _create_html(tag, inner_html, attributes = {}, data_attr = {}, self_closing = false) {
			let html = '<' + tag
			if (!is_array(inner_html) && is_object(inner_html)) {
				attributes = inner_html
				inner_html = null
			}
			for (let key in attributes) {
				if (attributes[key] === null) {
					html = html + ' ' + key
				}
				else {
					html = html + ' ' + key + '="' + attributes[key] + '"'
				}
			}
			for (let key in data_attr) {
				html = html + ' data-' + key + '="' + data_attr[key] + '"'
			}
			if (self_closing && !inner_html) {
				html = ' />'
			}
			else {
				html = html + '>'
				if (inner_html) {
					if (is_array(inner_html)) {
						for (let element of inner_html) {
							html = html + element
						}
					}
					else {
						html = html + inner_html
					}
				}
				html = html + '</' + tag + '>'
			}
			return html
		}

		function tag(tag, inner_html = null, attributes = {}, data_attr = {}, self_closing = false) {
			return _create_html(tag, inner_html, attributes, data_attr, self_closing)
		}

		function tag_factory(tag) {
			return function(inner_html, attributes = {}, data_attr = {}, self_closing = false) {
				return _create_html(tag, inner_html, attributes, data_attr, self_closing)
			}
		}

		function cls(...classes) {
			return {class: classes.join(' ')}
		}

		function append_to_element(element, str) {
			element.insertAdjacentHTML('beforeend', str)
			return element
		}

		function add_class(element, class_name) {
			if (is_array(element)) {
				for (let elem of element) {
					elem.classList.add(class_name)
				}
			}
			else {
				element.classList.add(class_name)
			}
		}

		function remove_class(element, class_name) {
			if (is_array(element)) {
				for (let elem of element) {
					elem.classList.remove(class_name)
				}
			}
			else if (is_HTMLCollection(element)) {
				element = Array.from(element)
				for (let elem of element) {
					elem.classList.remove(class_name)
				}
			}
			else {
				element.classList.remove(class_name)
			}
		}

		function has_class(element, class_name) {
			return element.classList.contains(class_name)
		}

		function add_event(element, type, handler) {
			element.addEventListener(type, handler)
		}

		function remove_event(element, type, handler) {
			element.removeEventListener(type, handler);
		}

		function click(element, handler) {
			add_event(element, 'click', handler)
		}

		function data(element, data_name, data_attr = null) {
			if (!data_attr) {
				return element.getAttribute('data-' + data_name)
			}
			else {
				element.setAttribute('data-' + data_name, data_attr)
			}
		}

		function change_selected() {
			let this_date
			remove_class(settings.parent.getElementsByClassName(settings.class_selected), settings.class_selected)
			for (let item of settings.selected_dates) {
				this_date = item.date
				let day = settings.parent.querySelector('[data-date="' + this_date.format(settings.date_format) + '"]')
				if (day) {
					add_class(day, settings.class_selected)
				}
			}
		}

		function get_value_index(property, value) {
			for (let i = 0; i < settings.selected_dates.length; i++) {
				let prop = settings.selected_dates[i][property]
				if (property === 'last_clicked') {
					if (prop === value) {
						return i
					}
				}
				else {
					if (prop.isSame(value, 'day')) {
						return i
					}
				}
			}
			return -1
		}

		function clear_selection() {
			remove_class(settings.parent.getElementsByClassName(settings.class_selected), settings.class_selected)
			return []
		}

		return era(options)
	}

	return Era
}))

(function() {
	let yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)
	$.each($('#monthTable').find('td'), function() {
		$(this).disableSelection()
	})
	$.each($('#quarterTable').find('td'), function() {
		$(this).disableSelection()
	})
	let selectedMonths
	let selectedQuarters

	$('#monthView').unbind('click').click(function() {
		$('#mtdLabel').show()
		$('#date_handle').hide()
		$('.selectedMonth').removeClass('selectedMonth')
		selectedMonths = [{
			date: (zeroPad(yesterday.getMonth() + 1)) + '-' + yesterday.getFullYear(),
			lastClicked: false
		}]
		$('[data-month="' + zeroPad(yesterday.getMonth() + 1) + '"]').addClass('selectedMonth')
		$('#dates_output').val(selectedMonths[0].date)
		$('#yearSelect option[value="' + yesterday.getFullYear() + '"]').prop('selected', true)
		$('.dateViewSelected').removeClass('dateViewSelected')
		$('#monthView').addClass('dateViewSelected')
		$('#dateGroup').hide()
		$('#monthGroup').show()
		$('#quarterGroup').hide()
		$('#viewSelector').text('View: Months')
		$('#prevYear').unbind('click').click(function() {
			if (!$('#yearSelect option:selected').is(':first-child')) {
				$('#yearSelect option:selected').removeAttr('selected').prev('option').prop('selected', true)
				changeSelected('month')
			}
		}).disableSelection()
		$('#nextYear').unbind('click').click(function() {
			if (!$('#yearSelect option:selected').is(':last-child')) {
				$('#yearSelect option:selected').removeAttr('selected').next('option').prop('selected', true)
				changeSelected('month')
			}
		}).disableSelection()
		$('#monthTable td').unbind('click').click(function(e) {
			if (e.ctrlKey && !$('#monthView').hasClass('noCtrl')) { //Control Key Held
				if ($(this).hasClass('selectedMonth')) { //clicking an element already selected
					removeMonth($(this))
				}
				else { //clicking an element not yet selected
					addMonth($(this).data('month'), $('#yearSelect option:selected').text(), $(this))
				}
			}
			else if (e.shiftKey && !$('#monthView').hasClass('noShift')) { //Shift Key Held
				let lastClicked = getValueIndex(selectedMonths, 'lastClicked', true)
				if (lastClicked > -1) { //a previous element has already been clicked
					let lastDate = selectedMonths[lastClicked].date.split('-')
					let thisDate = [$(this).data('month'), $('#yearSelect option:selected').text()]
					clearSelection()
					let earlierDate
					let laterDate
					if (new Date(lastDate[1], lastDate[0]) > new Date(thisDate[1], thisDate[0])) {
						earlierDate = new Date(thisDate[1], thisDate[0] - 1)
						laterDate = new Date(lastDate[1], lastDate[0] - 1)
					}
					else {
						laterDate = new Date(thisDate[1], thisDate[0] - 1)
						earlierDate = new Date(lastDate[1], lastDate[0] - 1)
					}
					let diff = monthDiff(earlierDate, laterDate)
					for (let x = 0; x <= diff + 1; x++) {
						let nextMonth = earlierDate.getMonth() + 1
						nextMonth = zeroPad(nextMonth)
						if (earlierDate.getFullYear() + '' === $('#yearSelect option:selected').text()) {
							addMonth(nextMonth, earlierDate.getFullYear(), $('[data-month="' + nextMonth + '"]'))
						}
						else {
							addMonth(nextMonth, earlierDate.getFullYear())
						}
						earlierDate.setMonth(parseInt(nextMonth, 10))
					}
				}
				else { //no previous last month clicked on
					addMonth($(this).data('month'), $('#yearSelect option:selected').text(), $(this))
				}
			}
			else { //Not Shift Key nor Control Key Held
				clearSelection()
				if (!$(this).hasClass('selectedMonth')) { //clicking an element that isn't already selected
					addMonth($(this).data('month'), $('#yearSelect option:selected').text(), $(this))
				}
			}
			$('#dates_output').val('')
			let dates_output = ''
			selectedMonths.sort(function(x, y) {
				let date1 = x.date.split('-')
				let date2 = y.date.split('-')
				if (new Date(date1[1], date1[0]) < new Date(date2[1], date2[0])) {
					return -1
				}
				if (new Date(date1[1], date1[0]) > new Date(date2[1], date2[0])) {
					return 1
				}
				return 0
			})
			for (let y = 0; y < selectedMonths.length; y++) {
				dates_output += selectedMonths[y].date + ', '
			}
			$('#dates_output').val(dates_output.slice(0, -2))
		})

		function addMonth(month, year, element) {
			if (element) {
				element.addClass('selectedMonth')
			}
			let dateString = month + '-' + year
			for (let i = 0; i < selectedMonths.length; i++) {
				selectedMonths[i].lastClicked = false
			}
			selectedMonths.push({date: dateString, lastClicked: true})
			return dateString
		}

		function removeMonth(element) {
			element.removeClass('selectedMonth')
			selectedMonths.splice(getValueIndex(selectedMonths, 'date', element.data('month')), 1)
		}

		function monthDiff(d1, d2) {
			let months
			months = (d2.getFullYear() - d1.getFullYear()) * 12
			months -= d1.getMonth() + 1
			months += d2.getMonth()
			return months <= 0 ? 0 : months
		}

		$('#yearSelect').change(function() {
			changeSelected('month')
		})
	}).disableSelection()

	$('#dayView').unbind('click').click(function() {
		$('#mtdLabel').hide()
		$('#viewSelector').text('View: Days')
		$('#monthGroup').hide()
		$('#quarterGroup').hide()
		$('#date_handle').show()
		era.set_dates([moment().subtract(1, 'days')])
		$('.dateViewSelected').removeClass('dateViewSelected')
		$('#dayView').addClass('dateViewSelected')
	}).disableSelection()

	$('#quarterView').unbind('click').click(function() {
		$('.selectedQuarter').removeClass('selectedQuarter')
		selectedQuarters = [{
			date: ("Q" + yesterday.getQuarter()) + ' ' + yesterday.getFullYear(),
			lastClicked: false
		}]
		$('[data-quarter="' + yesterday.getQuarter() + '"]').addClass('selectedQuarter')
		$('#dates_output').val(selectedQuarters[0].date)
		$('#quarterYearSelect option[value="' + yesterday.getFullYear() + '"]').prop('selected', true)
		$('#viewSelector').text('View: Quarters')
		$('#monthGroup').hide()
		$('#quarterGroup').show()
		$('#date_handle').hide()
		$('.dateViewSelected').removeClass('dateViewSelected')
		$('#quarterView').addClass('dateViewSelected')
		$('#prevQuarterYear').unbind('click').click(function() {
			if (!$('#quarterYearSelect option:selected').is(':first-child')) {
				$('#quarterYearSelect option:selected').removeAttr('selected').prev('option').prop('selected', true)
				changeSelected('quarter')
			}
		}).disableSelection()
		$('#nextQuarterYear').unbind('click').click(function() {
			if (!$('#quarterYearSelect option:selected').is(':last-child')) {
				$('#quarterYearSelect option:selected').removeAttr('selected').next('option').prop('selected', true)
				changeSelected('quarter')
			}
		}).disableSelection()
		$('#quarterTable td').unbind('click').click(function(e) {
			if (e.ctrlKey && !$('#quarterView').hasClass('noCtrl')) { //Control Key Held
				if ($(this).hasClass('selectedQuarter')) { //clicking an element already selected
					removeQuarter($(this))
				}
				else { //clicking an element not yet selected
					addQuarter($(this).data('quarter'), $('#quarterYearSelect option:selected').text(), $(this))
				}
			}
			else if (e.shiftKey && !$('#quarterView').hasClass('noShift')) { //Shift Key Held
				let lastClicked = getValueIndex(selectedQuarters, 'lastClicked', true)
				if (lastClicked > -1) { //a previous element has already been clicked
					let lastDate = selectedQuarters[lastClicked].date.replace('Q', '').split(' ')
					let thisDate = [$(this).data('quarter') + '', $('#quarterYearSelect option:selected').text()]
					clearSelection()
					let earlierDate
					let laterDate
					if (new Date(lastDate[1], lastDate[0] * 3 - 1) > new Date(thisDate[1], thisDate[0] * 3 - 1)) {
						earlierDate = new Date(thisDate[1], thisDate[0] * 3 - 1)
						laterDate = new Date(lastDate[1], lastDate[0] * 3 - 1)
					}
					else {
						laterDate = new Date(thisDate[1], thisDate[0] * 3 - 1)
						earlierDate = new Date(lastDate[1], lastDate[0] * 3 - 1)
					}
					let diff = quarterDiff(earlierDate, laterDate)
					for (let x = 0; x <= diff; x++) {
						let nextQuarter = earlierDate.getQuarter() + 1
						let thisQuarter = earlierDate.getQuarter()
						if (earlierDate.getFullYear() + '' === $('#quarterYearSelect option:selected').text()) {
							addQuarter(thisQuarter, earlierDate.getFullYear(), $('[data-quarter="' + thisQuarter + '"]'))
						}
						else {
							addQuarter(thisQuarter, earlierDate.getFullYear())
						}
						earlierDate.setQuarter(parseInt(nextQuarter, 10))
					}
				}
				else { //no previous last quarter clicked on
					addQuarter($(this).data('quarter'), $('#quarterYearSelect option:selected').text(), $(this))
				}
			}
			else { //Not Shift Key nor Control Key Held
				clearSelection()
				if (!$(this).hasClass('selectedQuarter')) { //clicking an element that isn't already selected
					addQuarter($(this).data('quarter'), $('#quarterYearSelect option:selected').text(), $(this))
				}
			}
			$('#dates_output').val('')
			let dates_output = ''
			selectedQuarters.sort(function(x, y) {
				let date1 = x.date.split('-')
				let date2 = y.date.split('-')
				if (new Date(date1[1], date1[0]) < new Date(date2[1], date2[0])) {
					return -1
				}
				if (new Date(date1[1], date1[0]) > new Date(date2[1], date2[0])) {
					return 1
				}
				return 0
			})
			for (let y = 0; y < selectedQuarters.length; y++) {
				dates_output += selectedQuarters[y].date + ', '
			}
			$('#dates_output').val(dates_output.slice(0, -2))

			function addQuarter(quarter, year, element) {
				if (element) {
					element.addClass('selectedQuarter')
				}
				let dateString = 'Q' + quarter + ' ' + year
				for (let i = 0; i < selectedQuarters.length; i++) {
					selectedQuarters[i].lastClicked = false
				}
				selectedQuarters.push({date: dateString, lastClicked: true})
				return dateString
			}

			function removeQuarter(element) {
				element.removeClass('selectedQuarter')
				selectedQuarters.splice(getValueIndex(selectedQuarters, 'date', element.data('quarter')), 1)
			}

			function quarterDiff(d1, d2) {
				let quarters
				quarters = (d2.getFullYear() - d1.getFullYear()) * 4
				quarters -= d1.getQuarter()
				quarters += d2.getQuarter()
				return quarters <= 0 ? 0 : quarters
			}

			$('#quarterYearSelect').change(function() {
				changeSelected('quarter')
			})
		})
	}).disableSelection()

	function changeSelected(type) {
		let x = 0
		let thisDate
		if (type === 'month') {
			$('.selectedMonth').removeClass('selectedMonth')
			for (x = 0; x < selectedMonths.length; x++) {
				thisDate = selectedMonths[x].date.split('-')
				if (thisDate[1] === $('#yearSelect option:selected').text()) {
					$('[data-month="' + thisDate[0] + '"]').addClass('selectedMonth')
				}
			}
		}
		else if (type === 'quarter') {
			$('.selectedQuarter').removeClass('selectedQuarter')
			for (x = 0; x < selectedQuarters.length; x++) {
				thisDate = selectedQuarters[x].date.replace('Q', '').split(' ')
				if (thisDate[1] === $('#quarterYearSelect option:selected').text()) {
					$('[data-quarter="' + thisDate[0] + '"]').addClass('selectedQuarter')
				}
			}
		}
	}

	function getValueIndex(arr, property, value) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i][property] === value) return i
		}
		return null
	}

	$('#tableClear').unbind('click').click(function() {
		clearFields()
		clearSelection()
	}).disableSelection()

	$('#filterClear').unbind('click').click(function() {
		let filters = [], $t = $(this), col = $t.data('filter-column')
		filters[col] = $t.data('filter-text') || $t.text()
		return false
	}).disableSelection()

	function clearSelection() {
		$('.selectedMonth').removeClass('selectedMonth')
		selectedMonths = []
		$('.selectedQuarter').removeClass('selectedQuarter')
		selectedQuarters = []
	}

	function clearFields() {
		$('.selectedOption').removeClass('selectedOption')
		$('.highlightedOption').removeClass('highlightedOption')
		$('#dates_output').val('')
		$('#headerFields').html('')
		$('#headerSps').html('')
		$('#headerAgents').val('')
	}
})