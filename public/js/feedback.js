$(function () {

    let myform = $("#feedback-form")
    let rating = $("#rating")
    let experience = $("#experience")
    let error = $("#error");
    let errorList = $("#errorList");

    if (myform) {
        myform.submit(function (event) {
            event.preventDefault();
            var rating_val = rating.val();
            var experience_val = experience.val();

            error.hide();

            if (!rating_val || rating_val.trim() === "") {
                errorList.append(`<li>Please provide a rating</li>`);
                error.show();
            }
            if (!experience_val || experience_val.trim() === "") {
                errorList.append(`<li>Please provide an experience</li>`);
                error.show();
            }

            if (error.is(":hidden")) {
                myForm.unbind().submit();
                myForm.submit();
            }
        })
    }
})