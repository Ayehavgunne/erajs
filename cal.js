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
			on_select: function () {},
			on_open: function () {},
			on_close: function () {},
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
			class_cal: 'caljs-cal_div',
			class_selected: 'caljs-selected_date',
			class_active: 'caljs-active',
			class_inactive: 'caljs-inactive',
			class_today: 'caljs-today',
			class_days: 'caljs-days',
			class_back_arrow: 'caljs-back_arrow',
			class_forward_arrow: 'caljs-forward_arrow',
			class_deselect_weekends: 'caljs-deselect_weekends',
			class_shortcuts: 'caljs-shortcuts',
			back_button: '&#9664;',
			forward_button: '&#9654;',
		}
		options = Object.assign(defaults, options)
		render(options, m.clone())
		bind_selectors(options)
		bind_navigation(options)
		bind_shortcuts(options)
	}

	function render(options, m) {
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
		let active = {class: options.class_active}
		let inactive_day = days_in_last_month - first_of_month_day + 1
		for (let x = 0; x <= 6; x++) {
			ths.push(th(weekdays[x]))
		}
		for (let x = 0; x < 6; x++) {
			tds = []
			for (let y = 0; y <= 6; y++) {
				if ((x === 0 && y >= first_of_month_day) || (x > 0 && day <= days_in_month)) {
					if (m.isSame(today, 'day')) {
						tds.push(td(div(day, {class: options.class_days + ' ' + options.class_today}), active, {date: m.format(options.date_format)}))
					}
					else {
						tds.push(td(div(day, {class: options.class_days}), active, {date: m.format(options.date_format)}))
					}
					day += 1
					m.add(1, 'days')
				}
				else {
					if (inactive_day > days_in_last_month) {
						inactive_day = 1
					}
					tds.push(td(div(inactive_day, {class: options.class_inactive})))
					inactive_day += 1
				}
			}
			trs.push(tr(tds))
		}
		let table = tag('table', [tag('thead', tr(ths)), tag('tbody', trs)])
		let header = tag('h4', [
			div(options.back_button, {class: options.class_back_arrow}),
			month_name + ' ' + year,
			div(options.forward_button, {class: options.class_forward_arrow})
		])
		let footer = div(span('Deselect Weekends', {class: options.class_deselect_weekends}), {class: options.class_shortcuts})
		let cal_div = div([header, table, footer], {class: options.class_cal})
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
					if (has_class(this, options.class_selected)) { //clicking an element already selected
						remove_date(options.class_selected, options.selected_dates, moment(data(this, 'date')), this)
					}
					else { //clicking an element not yet selected
						add_date(options.class_selected, options.selected_dates, moment(data(this, 'date')), this)
					}
				}
				else if (e.shiftKey && options.shift_click) { //Shift Key Held
					let last_clicked = get_value_index(options.selected_dates, 'last_clicked', true)
					if (last_clicked > -1) { //a previous element has already been clicked
						let last_date = options.selected_dates[last_clicked].date
						let this_date = moment(data(this, 'date'))
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
						add_date(options.class_selected, options.selected_dates, moment(data(this, 'date')), this)
					}
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
			options.element.innerHTML = ''
			options.moment = options.moment.add(1, 'months')
			render(options, options.moment.clone())
			bind_selectors(options)
			bind_navigation(options, true)
			change_selected(options)
		})
		click(back_button, function () {
			options.element.innerHTML = ''
			options.moment = options.moment.subtract(1, 'months')
			render(options, options.moment.clone())
			bind_selectors(options)
			bind_navigation(options, true)
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
		return null
	}

	function clear_selection(options) {
		remove_class(options.parent.getElementsByClassName(options.class_selected), options.class_selected)
		return []
	}

	return cal
}))
