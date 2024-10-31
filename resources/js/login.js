

$('body').on('submit', '#form', function (e) {
    e.preventDefault();
    console.log('xd');

    $('#textLogin').addClass('d-none');
    $('#spinnerLogin').removeClass('d-none');
    $('#btnSubmitLogin').attr('disabled', true);


    const formData = $(this).serialize();

    fetch('api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.success === true) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user_id', data.data.id)
                window.location.href = '/'
                $('#error-credentials').addClass('d-none');
               
            } else {
                $('#error-credentials').removeClass('d-none');
            }

            setTimeout(() => {

                $('#textLogin').removeClass('d-none');
                $('#spinnerLogin').addClass('d-none');
                $('#btnSubmitLogin').removeAttr('disabled');
            }, 300)
        })
        .catch(error => {
            console.log(error);
            $('#textLogin').removeClass('d-none');
            $('#spinnerLogin').addClass('d-none');
            $('#btnSubmitLogin').removeAttr('disabled');

            alert('Error interno en el servidor. Contacte al proveedor: ' + error);
        });
});
