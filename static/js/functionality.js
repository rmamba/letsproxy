$(document).ready(function () {
  $("i[name='domain']").click(function () {
    var domain = this.id;
    loadConfig(domain);
    MicroModal.show('modal-config');
  });

  // $("i[name='extraOptions']").click(function() {
  //     var domain = this.id;
  //     // loadConfig(domain);
  //     MicroModal.show('address-extra');
  // });

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

  upstreamExtraEvents();
  MicroModal.init();
});

function upstreamExtraEvents() {
  $("select[name='upstreamExtra[]']:not(.bound)").addClass('bound').click(function () {
    var port = $(this).data('port');
    console.log(port);
    var id = $(this).val();
    if (id === '1') {
      $('#weight-' + port).show();
    } else {
      $('#weight-' + port).hide();
    }
  });
}

var cnt = 1;

function addUpstreamAddress() {
  if (cnt < 7) {
    var wrapper = $('.addresses');
    var port = 3000 + Math.floor(Math.random() * 1000);
    wrapper.append('<div id="port-' + port + '"><input type="text" name="upstreamAddresses[]" placeholder="127.0.0.1">: <input type="text" name="upstreamPorts[]" placeholder="' + port + '" style="width: 65px;"> <select name="upstreamExtra[]" data-port="' + port + '"><option value="0">Default</option><option value="1">Weight</option><option value="2">Backup</option><option value="3">Down</option></select><input id="weight-' + port + '" type="text" name="upstreamWeight[]" data-port="' + port + '" placeholder=">=1" style="width: 50px; display: none;"><i class="material-icons pointer delete medium-icon" onclick="removeUpstreamAddress(' + port + ');">remove_circle_outline</i></div>');
    cnt++;
    upstreamExtraEvents();
  }
}

function removeUpstreamAddress(port) {
  $('#port-' + port).remove();
  cnt--;
}

function addServerRewrite() {
  if (cnt < 7) {
    var wrapper = $('.rewrites');
    var id = 1000 + Math.floor(Math.random() * 1000);
    wrapper.append('<div id="rewrite-' + id + '"><input type="text" name="rewriteKeys[]" placeholder="^/(?:jackets|sweats)/.*/(.*)$" style="width: 75%">: <input type="text" name="rewriteValues[]" placeholder="/products/$1" style="width: auto;"> <i class="material-icons pointer delete medium-icon" onclick="removeServerRewrite(' + id + ');">remove_circle_outline</i></div>');
    cnt++;
    // upstreamExtraEvents();
  }
}

function removeServerRewrite(id) {
  $('#rewrite-' + id).remove();
  cnt--;
}

function addServerLocation() {
  if (cnt < 7) {
    var wrapper = $('.locations');
    var id = 2000 + Math.floor(Math.random() * 1000);
    var html = '<div id="location-' + id + '">';
    html += '<input type="text" name="locationKeys[]" placeholder="~* /redirect/(.*)" style="width: 96%">';
    html += '<i class="material-icons pointer delete medium-icon" onclick="removeServerLocation(' + id + ');" style="float: right;">remove_circle_outline</i>';
    html += '<textarea rows="5" name="locationValues[]" placeholder="return 301 https://letspro.xyz/$1;" style="width: 100%;"></textarea>';
    html += '</div>';
    wrapper.append(html);
    cnt++;
  }
}

function removeServerLocation(id) {
  $('#location-' + id).remove();
  cnt--;
}
