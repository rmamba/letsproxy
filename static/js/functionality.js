$(document).ready(function() {
    $("i[name='domain']").click(function() {
        var domain = this.id;
        loadConfig(domain);
        MicroModal.show('modal-config');
    });

    function loadConfig(domain) {
        $('#modal-config-title').html(domain);
        $.ajax({
            url: '/ajax/config/' + domain,
            error: function () {
                alert('Error!!!');
            },
            success: function (data) {
                $('#config-data').html(data);
            }
        });
    }

    MicroModal.init();
});