function cal(options) {
	let m = moment()
	let defaults = {
		number_of_months: 1,
		ctrl_click: true,
		shift_click: true,
		current_day: m,
		selected_dates: [],
		on_select: function() {}
	}
	options = Object.assign(options, defaults)
	render(options.element, m)
	bind_clicks(options)
}

function render(element, m) {
	let this_m = m.clone()
	let month_name = this_m.format('MMMM')
	let today = this_m.date()
	let days_in_month = this_m.endOf('month').date()
	let first_of_month_day = this_m.startOf('month').day()
	let days_in_last_month = this_m.subtract(1, 'months').endOf('month').date()
	let weekdays = moment.weekdaysShort()
	this_m.add(1, 'months')
	this_m.date(1)
	let div = tag('div')
	let tr = tag('tr')
	let th = tag('th')
	let td = tag('td')
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
				if (day === today) {
					tds.push(td(div(day, {class: 'caljs-days'}), {class: 'caljs-active caljs-today'}, {date: this_m.format('YYYY-MM-DD')}))
				}
				else {
					tds.push(td(div(day, {class: 'caljs-days'}), {class: 'caljs-active'}, {date: this_m.format('YYYY-MM-DD')}))
				}
				day += 1
				this_m.add(1, 'days')
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
	let table = tag_string('table', [tag_string('thead', tr(ths)), tag_string('tbody', trs)])
	let cal_div = tag_string('div', [tag_string('h4', month_name), table], {class: 'caljs-cal_div'})
	append_to_element(element, cal_div)
}

function add_date(selected_dates, element) {
	let date
	if (is_element(element)) {
		date = data(element, 'date')
		add_class(element, 'caljs-selected_date')
	}
	else {
		date = element
	}
	for (let selected_date of selected_dates) {
		selected_date.last_clicked = false
	}
	selected_dates.push({date: date, last_clicked: true})
	return date
}

function remove_date(selected_dates, element) {
	remove_class(element, 'caljs-selected_date')
	selected_dates.splice(get_value_index(selected_dates, 'date', data(element, 'date')), 1)
}

function bind_clicks(options) {
	let cal_divs = document.getElementsByClassName('caljs-cal_div')
	for (let cal_div of cal_divs) {
		let tds = cal_div.querySelectorAll('td')
		for (let td of tds) {
			click(td, function (e) {
				if (e.ctrlKey && options.ctrl_click) { //Control Key Held
					if (has_class(this, 'caljs-selected_date')) { //clicking an element already selected
						remove_date(options.selected_dates, this)
					}
					else { //clicking an element not yet selected
						add_date(options.selected_dates, this)
					}
				}
				else if (e.shiftKey && options.shift_click) { //Shift Key Held
					let last_clicked = get_value_index(options.selected_dates, 'last_clicked', true)
					if (last_clicked > -1) { //a previous element has already been clicked
						clear_selection(options.selected_dates)
						let last_date = moment(options.selected_dates[last_clicked].date)
						let this_date = moment(data(this, 'date'))
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
							let date_str = earlierDate.format('YYYY-MM-DD')
							if (earlierDate.month() === options.current_day.month()) {
								add_date(options.selected_dates, date_str)
								add_class(document.querySelector('[data-date="' + date_str + '"]'), 'caljs-selected_date')
							}
							else {
								add_date(options.selected_dates, date_str)
							}
							earlierDate.add(1, 'days')
						}
					}
					else { //no previous last date clicked on
						add_date(options.selected_dates, this)
					}
				}
				else { //Neither Shift Key or Control Key Held
					clear_selection(options.selected_dates)
					if (!has_class(this, 'selected_date')) { //clicking an element that isn't already selected
						add_date(options.selected_dates, this)
					}
				}
				// console.log(options.selected_dates)
				options.on_select(options.selected_dates)
			})
		}
	}
}

// Utility functions
function is_array(val) {
	return val instanceof Array
}

function is_object(val) {
	if (val === null) {
		return false
	}
	return ((typeof val === 'function') || (typeof val === 'object'));
}

function is_function(val) {
	return typeof val === 'function'
}

function is_element(val) {
	return val instanceof HTMLElement
}

function is_string(val) {
	return typeof val === 'string'
}

function _create_html(inner_html, attributes = {}, data_attr = {}, self_closing = false, tag = null) {
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

function tag_string(tag, inner_html = null, attributes = {}, dat_attr = {}, self_closing = false) {
	return _create_html(inner_html, attributes, dat_attr, self_closing, tag)
}

function tag(tag) {
	return function (inner_html, attributes = {}, dat_attr = {}, self_closing = false) {
		return _create_html(inner_html, attributes, dat_attr, self_closing, tag)
	}
}

function append_to_element(element, str) {
	element.insertAdjacentHTML('beforeend', str)
	return element
}

function prepend_to_element(element, str) {
	element.insertAdjacentHTML('afterstart', str)
	return element
}

function add_class(element, class_name) {
	element.classList.add(class_name)
}

function remove_class(element, class_name) {
	element.classList.remove(class_name)
}

function has_class(element, class_name) {
	return element.classList.contains(class_name)
}

function addEvent(element, type, handler) {
	element.addEventListener(type, handler)
}

function removeEvent(element, type, handler) {
	element.removeEventListener(type, handler)
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

function change_selected(selected_dates, current_month) {
	let x = 0
	let this_date
	remove_class(document.querySelectorAll('.caljs-selected_date'), 'caljs-selected_date')
	for (let item of selected_dates) {
		this_date = item.date.split('-')
		if (this_date[1] === current_month) {
			add_class(document.querySelectorAll('[data-month="' + this_date[0] + '"]'), 'caljs-selected_date')
		}
	}
}

function get_value_index(arr, property, value) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i][property] === value) {
			return i
		}
	}
	return null
}

function clear_selection(...args) {
	for (let elem of document.querySelectorAll('.caljs-selected_date')) {
		remove_class(elem, 'caljs-selected_date')
	}
	for (let i of args.keys()) {
		args[i] = []
	}
}
