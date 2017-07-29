(function(global, factory) {
	global.cal = factory()
}(window, function() {
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
			on_select: function () {}
		}
		options = Object.assign(defaults, options)
		render(options, m.clone())
		bind_selectors(options)
		bind_navigation(options)
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
		let div = _tag_factory('div')
		let tr = _tag_factory('tr')
		let th = _tag_factory('th')
		let td = _tag_factory('td')
		let ths = []
		let tds = []
		let trs = []
		let day = 1
		let other_day = days_in_last_month - first_of_month_day + 1
		for (let x = 0; x <= 6; x++) {
			ths.push(th(weekdays[x]))
		}
		for (let x = 0; x < 6; x++) {
			tds = []
			for (let y = 0; y <= 6; y++) {
				if ((x === 0 && y >= first_of_month_day) || (x > 0 && day <= days_in_month)) {
					if (m.isSame(today, 'day')) {
						tds.push(td(div(day, {class: 'caljs-days'}), {class: 'caljs-active caljs-today'}, {date: m.format('YYYY-MM-DD')}))
					}
					else {
						tds.push(td(div(day, {class: 'caljs-days'}), {class: 'caljs-active'}, {date: m.format('YYYY-MM-DD')}))
					}
					day += 1
					m.add(1, 'days')
				}
				else {
					if (other_day > days_in_last_month) {
						other_day = 1
					}
					tds.push(td(div(other_day, {class: 'caljs-other_days'})))
					other_day += 1
				}
			}
			trs.push(tr(tds))
		}
		let table = _create_tag('table', [_create_tag('thead', tr(ths)), _create_tag('tbody', trs)])
		let cal_div = _create_tag('div', [_create_tag('h4', [div('&#9664;', {class: 'caljs-back_arrow'}), month_name + ' ' + year, div('&#9654;', {class: 'caljs-forward_arrow'})]), table], {class: 'caljs-cal_div'})
		_append_to_element(options.element, cal_div)
		options.parent = options.element.getElementsByClassName('caljs-cal_div').item(0)
	}

	function add_date(selected_dates, date, element=null) {
		if (element) {
			_add_class(element, 'caljs-selected_date')
		}
		for (let selected_date of selected_dates) {
			selected_date.last_clicked = false
		}
		selected_dates.push({date: date, last_clicked: true})
	}

	function remove_date(selected_dates, date, element=null) {
		if (element) {
			_remove_class(element, 'caljs-selected_date')
		}
		selected_dates.splice(get_value_index(selected_dates, 'date', date), 1)
	}

	function bind_selectors(options) {
		let tds = options.parent.querySelectorAll('.caljs-active')
		for (let td of tds) {
			click(td, function (e) {
				if (e.ctrlKey && options.ctrl_click) { //Control Key Held
					if (has_class(this, 'caljs-selected_date')) { //clicking an element already selected
						remove_date(options.selected_dates, moment(data(this, 'date')), this)
					}
					else { //clicking an element not yet selected
						add_date(options.selected_dates, moment(data(this, 'date')), this)
					}
				}
				else if (e.shiftKey && options.shift_click) { //Shift Key Held
					let last_clicked = get_value_index(options.selected_dates, 'last_clicked', true)
					if (last_clicked > -1) { //a previous element has already been clicked
						let last_date = options.selected_dates[last_clicked].date
						let this_date = moment(data(this, 'date'))
						options.selected_dates = clear_selection()
						let earlierDate
						let laterDate
						if (last_date.isAfter(this_date)) {
							earlierDate = this_date
							laterDate = last_date
						}
						else {
							laterDate = this_date
							earlierDate = last_date
						}
						let diff = laterDate.diff(earlierDate, 'days')
						for (let x = 0; x <= diff; x++) {
							if (earlierDate.month() === options.moment.month()) {
								add_date(options.selected_dates, earlierDate.clone(), document.querySelector('[data-date="' + earlierDate.format('YYYY-MM-DD') + '"]'))
							}
							else {
								add_date(options.selected_dates, earlierDate.clone())
							}
							earlierDate.add(1, 'days')
						}
					}
					else { //no previous last date clicked on
						add_date(options.selected_dates, moment(data(this, 'date')), this)
					}
				}
				else { //Neither Shift Key or Control Key Held
					options.selected_dates = clear_selection()
					if (!has_class(this, 'selected_date')) { //clicking an element that isn't already selected
						add_date(options.selected_dates, moment(data(this, 'date')), this)
					}
				}
				let dates = []
				for (let date of options.selected_dates) {
					dates.push(date.date)
				}
				options.on_select(dates.sort(function (a, b) {
					return a - b
				}))
			})
		}
	}

	function bind_navigation(options) {
		let back_button = options.parent.querySelector('.caljs-back_arrow')
		let forward_button = options.parent.querySelector('.caljs-forward_arrow')

		click(forward_button, function () {
			options.element.innerHTML = ''
			options.moment = options.moment.add(1, 'months')
			render(options, options.moment.clone())
			bind_selectors(options)
			bind_navigation(options)
			change_selected(options.selected_dates)
		})
		click(back_button, function () {
			options.element.innerHTML = ''
			options.moment = options.moment.subtract(1, 'months')
			render(options, options.moment.clone())
			bind_selectors(options)
			bind_navigation(options)
			change_selected(options.selected_dates)
		})
	}

	// Utility functions
	function _is_array(val) {
		return val instanceof Array
	}

	function _is_object(val) {
		if (val === null) {
			return false
		}
		return ((typeof val === 'function') || (typeof val === 'object'));
	}

	function _create_html(inner_html, attributes = {}, data_attr = {}, self_closing = false, tag = null) {
		let html = '<' + tag
		if (!_is_array(inner_html) && _is_object(inner_html)) {
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
					for (let elem of inner_html) {
						html = html + elem
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

	function _create_tag(tag, inner_html = null, attributes = {}, data_attr = {}, self_closing = false) {
		return _create_html(inner_html, attributes, data_attr, self_closing, tag)
	}

	function _tag_factory(tag) {
		return function (inner_html, attributes = {}, data_attr = {}, self_closing = false) {
			return _create_html(inner_html, attributes, data_attr, self_closing, tag)
		}
	}

	function _append_to_element(element, str) {
		element.insertAdjacentHTML('beforeend', str)
		return element
	}

	function _add_class(element, class_name) {
		if (_is_array(element)) {
			for (let elem of element) {
				elem.classList.add(class_name)
			}
		}
		else {
			element.classList.add(class_name)
		}
	}

	function _remove_class(element, class_name) {
		if (_is_array(element)) {
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

	function addEvent(element, type, handler) {
		element.addEventListener(type, handler)
	}

	function click(element, handler) {
		addEvent(element, 'click', handler)
	}

	function data(element, data_name, data_attr = null) {
		if (!data_attr) {
			return element.getAttribute('data-' + data_name)
		}
		else {
			element.setAttribute('data-' + data_name, data_attr)
		}
	}

	function change_selected(selected_dates) {
		let this_date
		for (let elem of document.querySelectorAll('.caljs-selected_date')) {
			_remove_class(elem, 'caljs-selected_date')
		}
		for (let item of selected_dates) {
			this_date = item.date
			let day = document.querySelector('[data-date="' + this_date.format('YYYY-MM-DD') + '"]')
			if (day) {
				_add_class(day, 'caljs-selected_date')
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

	function clear_selection() {
		for (let elem of document.querySelectorAll('.caljs-selected_date')) {
			_remove_class(elem, 'caljs-selected_date')
		}
		return []
	}

	return cal
}))
