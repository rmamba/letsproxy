$(document).ready(function() {
    $("i[name='domain']").click(function() {
        id = '#code-'+this.id;
        $(id).toggle();
    });
});