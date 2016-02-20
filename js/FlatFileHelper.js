
$(document).ready(function () {
    tipTiposCampos = 'Exemplo: A,X,9,9,A';
    tipTamanhosCampos = 'Exemplo: 1,4,12,8,2';
    tipTexto = 'Exemplo: HAAAA00000000000011111111BB';

    btnDebugar = $("#btnDebugar");
    cboLayouts = $("#cboLayouts");

    cboLayouts.on('change', function () {
        $("#txtTamanhosCampos").val($(this).find('option:selected').attr("tamanhos"));
        $("#txtTiposCampos").val($(this).find('option:selected').attr("tipos"));
        $("#txtTamanhosCampos").removeClass('textTip');
        $("#txtTiposCampos").removeClass('textTip');
    });

    btnDebugar.on('click', function () {
        $('#msgSucesso').hide();
        $('#msgErro').hide();

        txtTamanhosCampos = $("#txtTamanhosCampos").val().replace(/\s/g, "").toUpperCase();
        txtTiposCampos = $("#txtTiposCampos").val().replace(/\s/g, "").replace(/\(\d+\)/g, "").toUpperCase();

        if (!/^((\d+,)+)?\d+$/.test(txtTamanhosCampos)) {
            erro('O campo <b>Tamanho dos campos</b> deve conter números separados por vírgulas.');
            return false;
        }

        if (!/^(([9AX],)+)?[9AX]+$/g.test(txtTiposCampos)) {
            erro('O campo <b>Tipo dos campos</b> deve conter valores iniciados com A, 9 ou X (separados por vírgulas).');
            return false;
        }

        arrTamanhosCampos = txtTamanhosCampos.split(",").map(function (val) {
            return parseInt(val);
        });
        
        tamanhoLinha = arrTamanhosCampos.reduce(function (a, b) {
            return (a + b);
        });
        
        arrTiposCampos = txtTiposCampos.split(',');

        if (arrTamanhosCampos.length != arrTiposCampos.length) {
            msg = "A quantidade de <b>Tamanhos de Campos</b>, não corresponde com a quantidade de <b>Tipos de Campos</b><br>";
            msg += "Quantidade de Tamanhos de Campos: <b>" + arrTamanhosCampos.length + "</b><br>";
            msg += "Quantidade de Tipos de Campos: <b>" + arrTiposCampos.length + "</b>";
            erro(msg);
            return false;
        }

        if ($("#txtTexto").val().length != tamanhoLinha) {
            msg = "A linha informada possui uma quantidade de caracteres diferente da soma dos tamanhos de todos os campos. <br>";
            msg += "Soma dos tamanhos dos campos: <b>" + tamanhoLinha + "</b><br>";
            msg += "Tamanho da linha informada: <b>" + $("#txtTexto").val().length + "</b>";
            erro(msg);
            return false;
        }

        $("#analizerContainer").show();
        montaRegua(tamanhoLinha);
        montaTexto(arrTamanhosCampos, arrTiposCampos, tamanhoLinha);
    });

    textTip($("#txtTiposCampos"), tipTiposCampos);
    textTip($("#txtTamanhosCampos"), tipTamanhosCampos);
    textTip($("#txtTexto"), tipTexto);
});

function textTip(el, text) {
    el.val(text);
    el.addClass("textTip");
    el.on('blur', function () {
        if ($(this).val().trim() == "" || $(this).val().trim() == text) {
            $(this).addClass("textTip");
            $(this).val(text);
        }
    });
    el.on('focus', function () {
        if ($(this).hasClass("textTip") && $(this).val() == text) {
            $(this).removeClass("textTip");
            $(this).val("");
        }
    });
}

function montaRegua(largura) {
    reguaAltura = String(largura).length;
    paddedNumbers = [];

    for (i = 1; i <= largura; i++) {
        paddedNumbers.push(pad(i, reguaAltura));
    }

    spans = '';
    for (i = 0; i < largura; i++) {
        spans += '<span>' + paddedNumbers[i].split('').join('<br>') + '</span>';
    }
    $("#regua").html(spans);
}

function montaTexto(arrTamanhosCampos, arrTiposCampos) {
    erros = 0;
    texto = $("#txtTexto").val();
    
    novoTexto = '';
    campos = [];
    ultimaPosicao = 0;
    for (i = 0; i < arrTamanhosCampos.length; i++) {
        tamanho = arrTamanhosCampos[i];
        tipo = arrTiposCampos[i];
        
        campo = texto.substring(ultimaPosicao, ultimaPosicao + tamanho);
        title = 'Posição: ' + (i + 1) + '\nTamanho: ' + tamanho + '\nInício: ' + (ultimaPosicao + 1) + '\nFim: ' + (ultimaPosicao + tamanho) + '\nTipo: ' + getDescricaoTipoCampo(tipo);
        spanLetras = '<span>' + campo.split("").join('</span><span>') + '</span>';
        
        identificadorValido = true;
        //if(i==0){ 
        //      @TODO  corrigir!!!!
        //    identificadorValido = ehIdentificadorValido(campo);
        //}
        
        if (!ehCampoValido(campo, tipo, tamanho) || !identificadorValido) {
            erros++;
            campo = '<span class="error" title="' + title + '">' + spanLetras + '</span>';
        } else {
            campo = '<span title="' + title + '">' + spanLetras + '</span>';
        }
        novoTexto += campo;
        ultimaPosicao = ultimaPosicao + tamanho;
    }
    if (erros > 0) {
        erro("Foram encontrados erros nos campos indicados em vermelho.");
    } else {
        sucesso("A linha é válida.");
        
    }
    $("#texto").html(novoTexto);
    mouseEnterEvent();
}

function getDescricaoTipoCampo(tipo) {
    if (tipo == 'A') {
        return '(A)Alfanumérico';
    } else if (tipo == '9') {
        return '(9)Numérico';
    } else if (tipo == 'X') {
        return '(X)Branco/Alfanumérico';
    }
}

function mouseEnterEvent() {
    $("#texto > span").on('mouseenter', function () {
        $(this).append('<div class="destaque left"></div><div class="destaque right"></div>');
    });
    $("#texto > span").on('mouseleave', function () {
        $(this).find('.destaque').remove();
    });
}

function ehCampoValido(campo, tipo, tamanho) {
    if (tipo == 'A' || tipo == 'X') {
        re = new RegExp("^.{" + tamanho + "}$");
        if (re.test(campo)) {
            return true;
        }
    } else if (tipo == '9') {
        re = new RegExp("^[\\d]{" + tamanho + "}$");
        if (re.test(campo)) {
            return true;
        }
    }
    return false;
}

function ehIdentificadorValido(campo) {
    identificadores = $("#cboLayouts option:selected").attr("identificador").split(",");
    for (i in identificadores) {
        if (identificadores[i] == campo) {
            return true;
        }
    }
    return false;
}

function pad(str, len) {
    str = str + '';
    return str.length >= len ? str : new Array(len - str.length + 1).join(" ") + str;
}

function erro(msg) {
    $('#msgErro').html(msg).show();
}

function sucesso(msg) {
    $('#msgSucesso').html(msg).show();
}