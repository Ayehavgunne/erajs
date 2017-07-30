window.onload = function() {
	let cal1 = document.getElementById('cal1')
	let out1 = document.getElementById('output1')
	Cal({element: cal1, handle: out1, on_select: function(dates) {
		out1.value = dates.map((date) => date.format('YYYY-MM-DD')).join(', ')
	}})

	let cal2 = document.getElementById('cal2')
	let out2 = document.getElementById('output2')
	Cal({element: cal2, handle: out2, on_select: function(dates) {
		out2.value = dates.map((date) => date.format('YYYY-MM-DD')).join(', ')
	}, number_of_months: 2})


}
