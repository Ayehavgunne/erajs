function cal(options) {
	let m = moment()
	let defaults = {
		number_of_months: 1,
		date_format: 'YYYY-MM-DD',
		ctrl_click: true,
		shift_click: true,
		moment: m,
		parent: null,
		selected_dates: [],
		on_select: function () {
		}
	}
	options = Object.assign(defaults, options)
	render(options, m.clone())
	bind_selectors(options)
	bind_navigation(options)
}

function render(options, m) {
	let month_name = m.format('MMMM')
	let today = m.date()
	let days_in_month = m.endOf('month').date()
	let first_of_month_day = m.startOf('month').day()
	let days_in_last_month = m.subtract(1, 'months').endOf('month').date()
	let weekdays = moment.weekdaysShort()
	m.add(1, 'months')
	m.date(1)
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
	let table = tag_string('table', [tag_string('thead', tr(ths)), tag_string('tbody', trs)])
	let cal_div = tag_string('div', [tag_string('h4', [div('&#9664;', {class: 'caljs-back_arrow'}), month_name, div('&#9654;', {class: 'caljs-forward_arrow'})]), table], {class: 'caljs-cal_div'})
	append_to_element(options.element, cal_div)
	options.parent = options.element.getElementsByClassName('caljs-cal_div').get(0)
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

function bind_selectors(options) {
	// let cal_divs = document.getElementsByClassName('caljs-cal_div')
	// for (let cal_div of cal_divs) {
	let tds = options.parent.querySelectorAll('td')
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
					let last_date = moment(options.selected_dates[last_clicked].date)
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
							add_date(options.selected_dates, earlierDate)
							add_class(document.querySelector('[data-date="' + earlierDate.format('YYYY-MM-DD') + '"]'), 'caljs-selected_date')
						}
						else {
							add_date(options.selected_dates, earlierDate)
						}
						earlierDate.add(1, 'days')
					}
				}
				else { //no previous last date clicked on
					add_date(options.selected_dates, this)
				}
			}
			else { //Neither Shift Key or Control Key Held
				options.selected_dates = clear_selection()
				if (!has_class(this, 'selected_date')) { //clicking an element that isn't already selected
					add_date(options.selected_dates, moment(data(this, 'date')))
				}
			}
			let dates = []
			for (let date of options.selected_dates) {
				dates.push(date.date)
			}
			options.on_select(dates.sort())
		})
	}
	// }
}

function bind_navigation(options) {

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

function clear_selection() {
	for (let elem of document.querySelectorAll('.caljs-selected_date')) {
		remove_class(elem, 'caljs-selected_date')
	}
	return []
}
