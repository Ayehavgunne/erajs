window.onload = function() {
	let cal1 = document.getElementById('cal1')
	let out = document.getElementById('output')
	let handle = document.getElementById('show_cal')
	Cal({element: cal1, handle: handle, on_select: function(dates) {
		out.value = dates.map((date) => date.format('YYYY-MM-DD')).join(', ')
	}})
	let cal2 = document.getElementById('cal2')
	let out2 = document.getElementById('output2')
	let handle2 = document.getElementById('show_cal2')
	Cal({element: cal2, handle: handle2, on_select: function(dates) {
		out2.value = dates.map((date) => date.format('YYYY-MM-DD')).join(', ')
	}, number_of_months: 2})
}
