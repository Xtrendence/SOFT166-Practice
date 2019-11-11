$(document).ready(function() {
	$(".body-wrapper").on("click", function() {
		if($(this).hasClass("extended")) {
			toggleMenu("close");
		}
	});
	$(".icon-wrapper.menu").on("click", function() {
		toggleMenu();
	});
	function toggleMenu(action) {
		if($(".icon-wrapper.menu").hasClass("active") || action == "close") {
			$(".icon-wrapper.menu").removeClass("active");
			$(".menu-wrapper").css("width", "0");
			$(".body-wrapper").css("left", "0");
			setTimeout(function() {
				$(".body-wrapper").removeClass("extended");
			}, 250);
		}
		else {
			$(".icon-wrapper.menu").addClass("active");
			$(".menu-wrapper").css("width", "150px");
			$(".body-wrapper").css("left", "150px");
			setTimeout(function() {
				$(".body-wrapper").addClass("extended");
			}, 250);
		}
	}
});