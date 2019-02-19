$(document).ready(function() {
    $("tr[name='domain']").click(function() {
        id = '#code-'+this.id;
        $(id).toggle();
    });
});