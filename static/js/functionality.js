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

var cnt=1;
function addUpstreamAddress() {
    if (cnt<7) {
        var wrapper = $('.addresses');
        var port = 3000+Math.floor(Math.random() * 1000);
        wrapper.append('<div id="port-'+port+'"><input type="text" name="pass[][address]" placeholder="127.0.0.1">: <input type="text" name="pass[][port]" placeholder="'+port+'"><i class="material-icons pointer delete" onclick="removeUpstreamAddress('+port+');">remove_circle_outline</i></div>');
        cnt++;
    }
}

function removeUpstreamAddress(port) {
    $('#port-'+port).remove();
    cnt--;
}