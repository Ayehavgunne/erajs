(function (global, factory) {
	global.cal = factory()
}(window, function () {
	function cal(options) {
		let m = moment()
		let defaults = {
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
			on_select: function () {},
			on_open: function () {},
			on_close: function () {},
			on_destroy: function () {},
			select_event: function (dates) {
				let evt = new CustomEvent('caljs-select', {detail: dates})
				options.element.dispatchEvent(evt)
				options.on_select(dates)
			},
			open_event: function () {
				let evt = new CustomEvent('caljs-open')
				options.element.dispatchEvent(evt)
				options.on_open()
			},
			close_event: function () {
				let evt = new CustomEvent('caljs-close')
				options.element.dispatchEvent(evt)
				options.on_close()
			},
			destroy_event: function () {
				let evt = new CustomEvent('caljs-destroy')
				options.element.dispatchEvent(evt)
				options.on_destroy()
			},
			custom_shortcuts: [],
			class_cal: 'caljs-cal_div',
			class_selected: 'caljs-selected_date',
			class_active: 'caljs-active',
			class_inactive: 'caljs-inactive',
			class_today_highlight: 'caljs-today_highlight',
			class_days: 'caljs-days',
			class_back_arrow: 'caljs-back_arrow',
			class_forward_arrow: 'caljs-forward_arrow',
			class_shortcuts: 'caljs-shortcuts',
			class_shortcuts_title: 'caljs-shortcuts_title',
			class_deselect_weekends: 'caljs-deselect_weekends',
			class_mtd: 'caljs-mtd',
			class_today: 'caljs-today',
			class_yesterday: 'caljs-yesterday',
			class_this_week: 'caljs-this_week',
			class_last_week: 'caljs-last_week',
			class_clear: 'caljs-clear',
			back_button: '&#9664;',
			forward_button: '&#9654;',
		}
		options = Object.assign(defaults, options)
		render(options, m.clone())
		bind_selectors(options)
		bind_navigation(options)
		bind_shortcuts(options)

		return {
			destroy: function() {
				options.element.innerHTML = ""
				options.destroy_event()
				options.handle.style.cursor = ''
			},
			get_dates: function () {
				return get_selected_dates(options.selected_dates)
			},
			set_dates: function (dates) {
				options.selected_dates = clear_selection(options)
				if (dates) {
					for (let date of dates) {
						let selection = {date: date, last_clicked: false}
						options.selected_dates.push(selection)
					}
				}
				change_selected(options)
				options.select_event(get_selected_dates(options.selected_dates))
			},
			add_dates: function (dates) {
				for (let date of dates) {
					let date_exists = get_value_index(options.selected_dates, 'date', date) > -1
					if (!date_exists) {
						let selection = {date: date, last_clicked: false}
						options.selected_dates.push(selection)
					}
				}
				change_selected(options)
				options.select_event(get_selected_dates(options.selected_dates))
			},
			remove_dates: function(dates) {
				for (let date of dates) {
					let date_exists = get_value_index(options.selected_dates, 'date', date) > -1
					if (date_exists) {
						options.selected_dates.splice(get_value_index(options.selected_dates, 'date', date), 1)
					}
				}
				change_selected(options)
				options.select_event(get_selected_dates(options.selected_dates))
			},
			options: options
		}
	}

	function render(options, m) {
		options.element.innerHTML = ''
		let month_name = m.format('MMMM')
		let year = m.format('YYYY')
		let today = moment()
		let days_in_month = m.endOf('month').date()
		let first_of_month_day = m.startOf('month').day()
		let days_in_last_month = m.subtract(1, 'months').endOf('month').date()
		let weekdays = moment.weekdaysShort()
		m.add(1, 'months')
		m.date(1)
		let div = tag_factory('div')
		let span = tag_factory('span')
		let tr = tag_factory('tr')
		let th = tag_factory('th')
		let td = tag_factory('td')
		let ths = []
		let tds = []
		let trs = []
		let day = 1
		let active = cls(options.class_active)
		let inactive_day = days_in_last_month - first_of_month_day + 1
		for (let x = 0; x <= 6; x++) {
			ths.push(th(weekdays[x]))
		}
		for (let x = 0; x < 6; x++) {
			tds = []
			for (let y = 0; y <= 6; y++) {
				if ((x === 0 && y >= first_of_month_day) || (x > 0 && day <= days_in_month)) {
					if (m.isSame(today, 'day')) {
						tds.push(td(div(day, cls(options.class_days, options.class_today_highlight)), active, {date: m.format(options.date_format)}))
					}
					else {
						tds.push(td(div(day, cls(options.class_days)), active, {date: m.format(options.date_format)}))
					}
					day += 1
					m.add(1, 'days')
				}
				else {
					if (inactive_day > days_in_last_month) {
						inactive_day = 1
					}
					tds.push(td(div(inactive_day, cls(options.class_inactive))))
					inactive_day += 1
				}
			}
			trs.push(tr(tds))
		}
		let table = tag('table', [tag('thead', tr(ths)), tag('tbody', trs)])
		let header = tag('h4', [
			div(options.back_button, cls(options.class_back_arrow)),
			month_name + ' ' + year,
			div(options.forward_button, cls(options.class_forward_arrow))
		])
		let footer = ''
		if (options.shortcuts) {
			footer = div([
				div('Shortcuts', cls(options.class_shortcuts_title)),
				span('Deselect Weekends', cls(options.class_deselect_weekends)),
				span('MTD', cls(options.class_mtd)),
				span('Today', cls(options.class_today)),
				span('This Week', cls(options.class_this_week)),
				span('Last Week', cls(options.class_last_week)),
				span('Yesterday', cls(options.class_yesterday)),
				span('Clear', cls(options.class_clear)),
			], cls(options.class_shortcuts))
		}
		let cal_div = div([header, table, footer], cls(options.class_cal))
		append_to_element(options.element, cal_div)
		options.parent = options.element.getElementsByClassName(options.class_cal).item(0)
	}

	function add_date(class_name, selected_dates, date, element = null) {
		if (element) {
			add_class(element, class_name)
		}
		for (let selected_date of selected_dates) {
			selected_date.last_clicked = false
		}
		selected_dates.push({date: date, last_clicked: true})
	}

	function remove_date(class_name, selected_dates, date, element = null) {
		if (element) {
			remove_class(element, class_name)
		}
		selected_dates.splice(get_value_index(selected_dates, 'date', date), 1)
	}

	function bind_selectors(options) {
		let tds = options.parent.querySelectorAll('.' + options.class_active)
		for (let td of tds) {
			click(td, function (e) {
				if (e.ctrlKey && options.ctrl_click) { //Control Key Held
					ctrl_click(options, this)
				}
				else if (e.shiftKey && options.shift_click) { //Shift Key Held
					shift_click(options, this)
				}
				else { //Neither Shift Key or Control Key Held
					if (!has_class(this, options.class_selected)) { //clicking an element that isn't already selected
						options.selected_dates = clear_selection(options)
						add_date(options.class_selected, options.selected_dates, moment(data(this, 'date')), this)
					}
				}
				options.select_event(get_selected_dates(options.selected_dates))
			})
		}
	}

	function bind_navigation(options, handle_bound=false) {
		let back_button = options.parent.getElementsByClassName(options.class_back_arrow).item(0)
		let forward_button = options.parent.getElementsByClassName(options.class_forward_arrow).item(0)

		click(forward_button, function () {
			options.moment = options.moment.add(1, 'months')
			render(options, options.moment.clone())
			bind_selectors(options)
			bind_navigation(options, true)
			bind_shortcuts(options)
			change_selected(options)
		})
		click(back_button, function () {
			options.moment = options.moment.subtract(1, 'months')
			render(options, options.moment.clone())
			bind_selectors(options)
			bind_navigation(options, true)
			bind_shortcuts(options)
			change_selected(options)
		})
		if (options.handle) {
			if (!handle_bound) {
				options.handle.style.cursor = 'pointer'
				options.parent.style.display = 'none'
			}
			click(options.handle, function () {
				options.handle.style.cursor = ''
				options.parent.style.display = ''
				move_el_to_bottom_of_other(options.parent, options.handle, options.vertical_offset, options.horizontal_offset)
				if (!is_fully_on_screen(options.parent)) {
					move_element_on_screen(options.parent)
				}
				click_outside_close(options.parent, function () {
					options.handle.style.cursor = 'pointer'
					options.close_event()
				})
				options.open_event()
			})
			move_el_to_bottom_of_other(options.parent, options.handle, options.vertical_offset, options.horizontal_offset)
			if (!is_fully_on_screen(options.parent)) {
				move_element_on_screen(options.parent)
			}
			click_outside_close(options.parent, function () {
				options.handle.style.cursor = 'pointer'
			})
		}
	}

	function bind_shortcuts(options) {
		let shortcut_div = options.parent.getElementsByClassName(options.class_shortcuts).item(0)
		let deselect_weekends = shortcut_div.getElementsByClassName(options.class_deselect_weekends).item(0)
		let mtd = shortcut_div.getElementsByClassName(options.class_mtd).item(0)
		let today_button = shortcut_div.getElementsByClassName(options.class_today).item(0)
		let yesterday = shortcut_div.getElementsByClassName(options.class_yesterday).item(0)
		let this_week = shortcut_div.getElementsByClassName(options.class_this_week).item(0)
		let last_week = shortcut_div.getElementsByClassName(options.class_last_week).item(0)
		let clear = shortcut_div.getElementsByClassName(options.class_clear).item(0)
		click(deselect_weekends, function () {
			for (let key of Array.from(options.selected_dates.keys()).reverse()) {
				let date = options.selected_dates[key].date
				if (date.day() === 0 || date.day() === 6) {
					let element = options.parent.querySelector('[data-date="' + date.format(options.date_format) + '"]')
					remove_date(options.class_selected, options.selected_dates, date, element)
				}
			}
			options.select_event(get_selected_dates(options.selected_dates))
		})
		click(mtd, function (e) {
			let today = moment()
			let start = moment().startOf('month')
			if (!(e.ctrlKey && options.ctrl_click)) {
				options.selected_dates = clear_selection(options)
			}
			while (start.isSameOrBefore(today, 'days')) {
				add_date(options.class_selected, options.selected_dates, start.clone())
				start.add(1, 'days')
			}
			render(options, today)
			bind_selectors(options)
			bind_navigation(options, true)
			bind_shortcuts(options)
			change_selected(options)
			options.select_event(get_selected_dates(options.selected_dates))
		})
		click(today_button, function (e) {
			let today = moment()
			if (e.shiftKey && options.shift_click) {
				let element = options.parent.querySelector('[data-date="' + today.format(options.date_format) + '"]')
				shift_click(options, element)
			}
			else if (!(e.ctrlKey && options.ctrl_click)) {
				options.selected_dates = clear_selection(options)
				add_date(options.class_selected, options.selected_dates, today.clone())
			}
			else {
				add_date(options.class_selected, options.selected_dates, today.clone())
			}
			render(options, today)
			bind_selectors(options)
			bind_navigation(options, true)
			bind_shortcuts(options)
			change_selected(options)
			options.select_event(get_selected_dates(options.selected_dates))
		})
		click(yesterday, function (e) {
			let yest = moment().subtract(1, 'days')
			if (e.shiftKey && options.shift_click) {
				let element = options.parent.querySelector('[data-date="' + yest.format(options.date_format) + '"]')
				shift_click(options, element)
			}
			else if (!(e.ctrlKey && options.ctrl_click)) {
				options.selected_dates = clear_selection(options)
				add_date(options.class_selected, options.selected_dates, yest.clone())
			}
			else {
				add_date(options.class_selected, options.selected_dates, yest.clone())
			}
			render(options, yest)
			bind_selectors(options)
			bind_navigation(options, true)
			bind_shortcuts(options)
			change_selected(options)
			options.select_event(get_selected_dates(options.selected_dates))
		})
		click(this_week, function (e) {
			let week_start = moment().startOf('week')
			let week_end = moment().endOf('week')
			if (!(e.ctrlKey && options.ctrl_click)) {
				options.selected_dates = clear_selection(options)
			}
			while (week_start.isSameOrBefore(week_end, 'days')) {
				add_date(options.class_selected, options.selected_dates, week_start.clone())
				week_start.add(1, 'days')
			}
			render(options, moment())
			bind_selectors(options)
			bind_navigation(options, true)
			bind_shortcuts(options)
			change_selected(options)
			options.select_event(get_selected_dates(options.selected_dates))
		})
		click(last_week, function (e) {
			let week_start = moment().subtract(1, 'week').startOf('week')
			let week_end = moment().subtract(1, 'week').endOf('week')
			if (!(e.ctrlKey && options.ctrl_click)) {
				options.selected_dates = clear_selection(options)
			}
			while (week_start.isSameOrBefore(week_end, 'days')) {
				add_date(options.class_selected, options.selected_dates, week_start.clone())
				week_start.add(1, 'days')
			}
			render(options, week_start.startOf('week'))
			bind_selectors(options)
			bind_navigation(options, true)
			bind_shortcuts(options)
			change_selected(options)
			options.select_event(get_selected_dates(options.selected_dates))
		})
		click(clear, function() {
			options.selected_dates = clear_selection(options)
			change_selected(options)
			options.select_event(get_selected_dates(options.selected_dates))
		})
		for (let shortcut of options.custom_shortcuts) {
			let label = shortcut.label
			let class_name = shortcut.class
			append_to_element(shortcut_div, tag('span', label, cls(class_name)))
			let shortcut_element = shortcut_div.getElementsByClassName(class_name).item(0)
			click(shortcut_element, function(e) {
				let dates = shortcut.callback(options, e)
				options.selected_dates = clear_selection(options)
				for (let date of dates) {
					let element = options.parent.querySelector('[data-date="' + date.format(options.date_format) + '"]')
					add_date(options.class_selected, options.selected_dates, date, element)
				}
			})
		}
	}

	function ctrl_click(options, self) {
		if (has_class(this, options.class_selected)) { //clicking an element already selected
			remove_date(options.class_selected, options.selected_dates, moment(data(self, 'date')), self)
		}
		else { //clicking an element not yet selected
			add_date(options.class_selected, options.selected_dates, moment(data(self, 'date')), self)
		}
	}

	function shift_click(options, self) {
		let last_clicked = get_value_index(options.selected_dates, 'last_clicked', true)
		if (last_clicked > -1) { //a previous element has already been clicked
			let last_date = options.selected_dates[last_clicked].date
			let this_date = moment(data(self, 'date'))
			options.selected_dates = clear_selection(options)
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
				if (earlier_date.month() === options.moment.month()) {
					add_date(options.class_selected, options.selected_dates, earlier_date.clone(), document.querySelector('[data-date="' + earlier_date.format(options.date_format) + '"]'))
				}
				else {
					add_date(options.class_selected, options.selected_dates, earlier_date.clone())
				}
				earlier_date.add(1, 'days')
			}
		}
		else { //no previous last date clicked on
			add_date(options.class_selected, options.selected_dates, moment(data(self, 'date')), self)
		}
	}

	// Utility functions
	function is_array(val) {
		return val instanceof Array
	}

	function is_HTMLCollection(val) {
		return val instanceof HTMLCollection
	}

	function is_object(val) {
		if (val === null) {
			return false
		}
		return ((typeof val === 'function') || (typeof val === 'object'));
	}

	function get_selected_dates(selected_dates) {
		let dates = []
		for (let date of selected_dates) {
			dates.push(date.date)
		}
		dates = dates.sort(function (a, b) {
			return a - b
		})
		return dates
	}

	function click_outside_close(element, callback) {
		add_event(document, 'mouseup', function close(e) {
			if (element !== e.target && !element.contains(e.target)) {
				element.style.display = 'none'
				if (typeof callback === 'function') {
					callback()
				}
				remove_event(document, 'mouseup', close)
			}
		})
	}

	function is_fully_on_screen(element) {
		let rect = element.getBoundingClientRect()
		return rect.top > 0 &&
			rect.left > 0 &&
			rect.bottom < window.innerHeight &&
			rect.right < window.innerWidth
	}

	function on_screen_offset(element) {
		let offsets = {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0
		}
		let rect = element.getBoundingClientRect()
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

	function move_element_on_screen(element) {
		let offsets = on_screen_offset(element)
		if (offsets.left) {
			element.style.transform = 'translateX(' + (-offsets.left) + 'px)'
		}
		if (offsets.right) {
			element.style.transform = 'translateX(' + offsets.right + 'px)'
		}
	}

	function move_el_to_bottom_of_other(element, other, vertical_offset, horizontal_offset) {
		let offsets = other.getBoundingClientRect()
		element.style.top = (offsets.bottom + vertical_offset) + 'px'
		element.style.left = (offsets.left + horizontal_offset) + 'px'
	}

	function _create_html(tag, inner_html, attributes = {}, data_attr = {}, self_closing = false) {
		let html = '<' + tag
		if (!is_array(inner_html) && is_object(inner_html)) {
			attributes = inner_html
			inner_html = null
		}
		for (let key in attributes) {
			html = html + ' ' + key + '="' + attributes[key] + '"'
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
				if (inner_html.constructor === Array) {
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
		return function (inner_html, attributes = {}, data_attr = {}, self_closing = false) {
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

	function change_selected(options) {
		let this_date
		remove_class(options.parent.getElementsByClassName(options.class_selected), options.class_selected)
		for (let item of options.selected_dates) {
			this_date = item.date
			let day = options.parent.querySelector('[data-date="' + this_date.format(options.date_format) + '"]')
			if (day) {
				add_class(day, options.class_selected)
			}
		}
	}

	function get_value_index(arr, property, value) {
		for (let i = 0; i < arr.length; i++) {
			let prop = arr[i][property]
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

	function clear_selection(options) {
		remove_class(options.parent.getElementsByClassName(options.class_selected), options.class_selected)
		return []
	}

	return cal
}))
