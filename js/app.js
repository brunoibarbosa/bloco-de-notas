const overlay = document.querySelector('.overlay'),
    campoNovaNota = document.querySelector('.campoAddNota > section > section'),
    tituloNovaNota = document.querySelector('#tituloNovaNota'),
    textoNovaNota = document.querySelector('#textoNovaNota'),
    inputFiltrar = document.querySelector('#inputFiltrar'),
    btnSelect = document.querySelector('#selectOrdenar'),
    inputData = document.querySelector('#inputData'),
    saidaDados = document.querySelector('#saidaDados')

class Nota {
    constructor(titulo, texto, data, id) {
        this.titulo = titulo
        this.texto = texto
        this.data = data
        this.id = id
    }

    validarDados() {
        for (let i in this) {
            if (i === 'titulo') continue
            if (!this[i]) {
                return false
            }
        }
        return true
    }
}

class Bd {
    constructor() {
        let id = Number(localStorage.getItem('id'))

        if (!id) {
            localStorage.setItem('id', 0)
        }
    }

    get proximoId() {
        return Number(localStorage.getItem('id')) + 1
    }

    registraNota(editando) {
        let titulo = tituloNovaNota.value.trim()
        let texto = textoNovaNota.value.trim().replace(/\s{2,}/g, ' ')
        let id = this.proximoId

        if (editando) {
            titulo = document.querySelector('#tituloEdita').value.trim()
            texto = document.querySelector('#conteudoEdita').value.trim()
        }

        if (titulo === '')
            titulo = 'Sem título'

        let data = new Date()
        let nota = new Nota(titulo, texto, data, id)

        if (nota.validarDados()) {
            nota = JSON.stringify(nota)
            localStorage.setItem(id, nota)
            localStorage.setItem('id', id)
        } else return false
    }

    recuperaNotas() {
        const notas = []
        const id = localStorage.getItem('id')

        for (let i = 0; i <= id; i++) {
            const nota = JSON.parse(localStorage.getItem(i))
            if (nota) {
                notas.unshift(nota)
            }
        }
        return notas
    }

    carregaNotas(notas = this.recuperaNotas()) {
        notas.forEach((n) => {
            const nota = document.querySelector('main > .nota').cloneNode(true)

            nota.setAttribute('id', `N${n.id}`)
            nota.querySelector('.titulo_nota').textContent = n.titulo
            nota.querySelector('.txt_nota').textContent = n.texto

            const data = new Date(n.data)
            const dia = data.getDate().toString().length === 2 ? data.getDate() : '0' + data.getDate()
            const mes = (data.getMonth() + 1).toString().length === 2 ? data.getMonth() + 1 : '0' + (data.getMonth() + 1)
            const ano = data.getFullYear().toString()
            const hora = data.getHours().toString().length === 2 ? data.getHours() : '0' + data.getHours()
            const minuto = data.getMinutes().toString().length === 2 ? data.getMinutes() : '0' + data.getMinutes()

            nota.querySelector('.data_nota').textContent = `Última alteração feita em ${dia}/${mes}/${ano} às ${hora}:${minuto}`
            saidaDados.appendChild(nota)
            existeAnotacao()
        })
    }

    removeNota(id) {
        localStorage.removeItem(id)
        existeAnotacao()
    }
}

document.addEventListener('click', el => {
    const e = el.target

    // Se existir balão aberto, será fechado
    if (document.querySelector('.aberto')) {
        if (e.classList.contains('fecharBalao') || e.classList.contains('overlay')) {
            document.querySelector('.aberto').classList.toggle('aberto')
            overlay.classList.toggle('aberto')
        }
    }

    // Expande nova nota
    if (e.id === 'tituloNovaNota' || e.id === 'textoNovaNota') {
        campoNovaNota.parentElement.classList.add('ativo')
        textoNovaNota.setAttribute('placeholder', 'Texto')
    } else if (textoNovaNota.value.trim() == '') {
        textoNovaNota.value = ''
        textoNovaNota.style.height = '45px'
        textoNovaNota.setAttribute('placeholder', '')
        campoNovaNota.parentElement.classList.remove('ativo')
    }

    // Mostra ou oculta opções
    if (e.id === 'mostrarOpc') {
        document.querySelector('.campoOpc').classList.toggle('oculto')
    }

    // Criar nova nota
    if (e.id === 'btnAddNota') {
        bd.registraNota()
        limpaCampos();
        existeAnotacao()
        textoNovaNota.style.height = '45px'
    }

    // Filtrar notas
    if (e.id === 'btnFiltrar') {
        filtrarNotas()
    }

    // Limpar campos de entrada de dados
    if (e.id === 'btnLimpar') {
        limpaCampos()
    }

    // Copiar texto da nota ao clicar no botão
    if (e.id === 'btnCopia') {
        const nota = e.parentElement.parentElement.querySelector('.txt_nota')
        copiarNota(nota)
        notificaCopiou(nota)
    }

    // Abre janela de edição
    if (e.id === 'btnEdita') {
        const id = e.parentElement.parentElement.id.replace('N', '')
        janelaEdita(id)
    }

    // Executa ação de editar
    if (e.id === 'btnSalvar') {
        const id = Number(document.querySelector('#editaNota').dataset.editandoNota)
        if (document.querySelector('#conteudoEdita').value.trim() != '') {
            bd.registraNota(true)
            bd.removeNota(id)
            saidaDados.innerHTML = ''
            bd.carregaNotas()
            document.querySelector('#editaNota').classList.toggle('aberto')
            overlay.classList.toggle('aberto')
        } else
            alert('Insira algum texto')
    }

    // Excluir nota
    if (e.id === 'btnRemove') {
        const nota = e.parentElement.parentElement
        const id = nota.id.replace('N', '')
        nota.remove()
        bd.removeNota(id)
    }
})

// Copia conteúdo da nota
function copiarNota(p) {
    const range = document.createRange()
    window.getSelection().removeAllRanges()
    range.selectNode(p)
    window.getSelection().addRange(range)
    document.execCommand('copy')
    window.getSelection().removeAllRanges()
}

// Aviso de cópia
function notificaCopiou(p) {
    if (!p.parentElement.classList.contains('copiado')) {
        p.parentElement.classList.toggle('copiado')
        setTimeout(() => p.parentElement.classList.toggle('copiado'), 1000)
    }
}

// Limpa os campos de entrada de dados
function limpaCampos() {
    tituloNovaNota.value = ''
    textoNovaNota.value = ''
    inputFiltrar.value = ''
    saidaDados.classList.remove('antigos')
    btnSelect.value = 'recentes'
    inputData.value = ''
    saidaDados.innerHTML = ''
    bd.carregaNotas()
}

// Abre a janela de edição
function janelaEdita(id) {
    const titulo = document.querySelector('#tituloEdita')
    const textarea = document.querySelector('#conteudoEdita')
    const nota = JSON.parse(localStorage.getItem(id))

    titulo.value = nota.titulo ? nota.titulo : 'Sem título'
    textarea.value = nota.texto

    // Mostra janela
    const janela = document.querySelector('#editaNota')
    janela.setAttribute('data-editando-nota', id)
    janela.classList.toggle('aberto')
    overlay.classList.toggle('aberto')
}

function filtrarNotas() {
    const txtFiltro = inputFiltrar.value.toLowerCase().trim()
    const notas = bd.recuperaNotas().filter((n) => {
        if (!txtFiltro != '') return true
        if (n.texto.toLowerCase().indexOf(txtFiltro) > -1 || n.titulo.toLowerCase().indexOf(txtFiltro) > -1)
            return true
    })

    saidaDados.innerHTML = ''
    bd.carregaNotas(notas)
}

// Ordena as notas
function ordenarNotas() {
    btnSelect.addEventListener('change', () => {
        if (btnSelect.value === 'recentes') {
            saidaDados.classList.remove('antigos')
        }
        else {
            saidaDados.classList.add('antigos')
        }
    })
}

// Filtra pela data
function filtraData() {
    inputData.addEventListener('change', function () {
        const data = new Date(Date.parse(inputData.value) + 1000 * 60 * 60 * 3)

        const notas = bd.recuperaNotas().filter((n) => {
            const dataN = new Date(n.data)

            if (data.getDate() === dataN.getDate() && data.getMonth() === dataN.getMonth() && data.getFullYear() === dataN.getFullYear())
                return true
        })

        saidaDados.innerHTML = ''
        bd.carregaNotas(notas)
    })
}

// Verifica se tem ou não alguma anotação
function existeAnotacao() {
    if (saidaDados.hasChildNodes())
        saidaDados.classList.remove('semNota')
    else
        saidaDados.classList.add('semNota')
}

// Resize campo do editar
function ajustaCampoEdicao() {
    const observer = new MutationObserver(function () {
        autosize()
    })

    // Monitora janela de edição
    observer.observe(document.querySelector('#editaNota'), {
        attributes: true,
        attributeFilter: ['class'],
        childList: false,
        characterData: false
    })

    const textarea = document.querySelector('#editaNota textarea')
    textarea.addEventListener('keydown', autosize)

    function autosize() {
        textarea.style.cssText = 'height: auto'
        textarea.style.cssText = '-moz-box-sizing: content-box'
        textarea.style.cssText = 'height:' + textarea.scrollHeight + 'px'
    }
}

function ajustaCampoNovaNota() {
    textoNovaNota.addEventListener('input', autosize)

    function autosize() {
        textoNovaNota.style.cssText = 'height: auto'
        textoNovaNota.style.cssText = '-moz-box-sizing: content-box'
        textoNovaNota.style.cssText = 'height:' + textoNovaNota.scrollHeight + 'px'
    }
}

const bd = new Bd()
bd.carregaNotas()
ordenarNotas()
filtraData()
ajustaCampoEdicao()
ajustaCampoNovaNota()