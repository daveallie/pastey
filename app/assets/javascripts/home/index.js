Pastey = {}

Pastey.Images = {
  addImage: function(base64) {
    var id = Pastey.Images.Data.add(base64)
      , img = $('<img />').attr('src', base64)
      , deleteImage = $('<span class="glyphicon glyphicon-trash img-btn" aria-hidden="true"></span>')
      , imageUp = $('<span class="glyphicon glyphicon-arrow-up img-btn" aria-hidden="true"></span>')
      , imageDown = $('<span class="glyphicon glyphicon-arrow-down img-btn" aria-hidden="true"></span>')
      , buttonContainer = $('<div class="btncontainer" />').attr('data-id', id).append(deleteImage).append(imageUp).append(imageDown)
    $('body').append($('<div class="imgcontainer" data-id='+id+'/>').append('<hr />').append(buttonContainer).append(img))

    deleteImage.click(Pastey.Handlers.destroyImage)
    imageUp.click(Pastey.Handlers.moveImageUp)
    imageDown.click(Pastey.Handlers.moveImageDown)
  },
  destroyImage: function(id) {
    $('.imgcontainer[data-id=' + id + ']').remove()
    Pastey.Images.Data.remove(id)
  },
  swapIds: function(id1, id2) {
    var el1 = $('[data-id=' + id1 + ']')
      , el2 = $('[data-id=' + id2 + ']')

    el1.attr('data-id', id2)
    el2.attr('data-id', id1)
  }
}

Pastey.Images.Data = function() {
  var data = {}
    , id = 0

  return {
    add: function(base64) {
      data[id] = base64
      return id++
    },
    remove: function(id) {
      delete data[id]
    },
    count: function() {
      return Object.keys(data).length
    },
    getShortlink: function(callback) {
      var images = Object.keys(data).map(function(k){return data[k]})
      $.ajax({
        type: 'POST',
        url: 'shorten',
        data: {image_data: images},
        success: callback
      })
    }
  }
}()

Pastey.Handlers = function() {
  var showInput = function() {
    $('.shortlink-btn').hide()
    $('.shortlink-address').show()
  }

  var showBtn = function() {
    $('.shortlink-address').hide()
    var btn = $('.shortlink-btn')
    btn.show()
    if (Pastey.Images.Data.count() === 0 ^ btn.hasClass('disabled')) {
      btn.toggleClass('disabled')
    }
  }

  var readerOnLoad = function(event) {
    Pastey.Images.addImage(event.target.result)
    showBtn()
  }

  var loadImage = function(file) {
    if (file.type.match(/image.*/)) {
      var reader = new FileReader()
      reader.onload = readerOnLoad
      reader.readAsDataURL(file) // start reading the file data.
    }
  }

  return {
    getShortlink: function() {
      var btn = $(this)
        , input = $('.shortlink-address')

      btn.button('loading')

      Pastey.Images.Data.getShortlink(function(data) {
        input.val(data)
        showInput()
        btn.button('reset')
        history.replaceState('', 'Pastey', data)
      })
    },
    destroyImage: function(e) {
      Pastey.Images.destroyImage($(this).closest('.imgcontainer').data('id'))
      showBtn()
    },
    moveImageUp: function(e) {
      var thisImg = $(this).closest('.imgcontainer')
        , prevImg = thisImg.prev('.imgcontainer')

      if (prevImg.length === 0) return;

      thisImg.insertBefore(prevImg)
      Pastey.Images.swapIds(thisImg.data('id'), prevImg.data('id'))
      showBtn()
    },
    moveImageDown: function(e) {
      var thisImg = $(this).closest('.imgcontainer')
        , nextImg = thisImg.next('.imgcontainer')

      if (nextImg.length === 0) return;

      thisImg.insertAfter(nextImg)
      Pastey.Images.swapIds(thisImg.data('id'), nextImg.data('id'))
      showBtn()
    },
    onPaste: function(event) {
      var items = (event.clipboardData || event.originalEvent.clipboardData).items
      for (var index in items) {
        var item = items[index]
        if (item.kind === 'file') {
          loadImage(item.getAsFile())
        }
      }
    },
    onDragover: function(e) {
      e.stopPropagation()
      e.preventDefault ? e.preventDefault() : (e.returnValue = false);
      (e.dataTransfer || e.originalEvent.dataTransfer).dropEffect = 'copy'
    },
    onDrop: function(e) {
      e.stopPropagation()
      e.preventDefault ? e.preventDefault() : (e.returnValue = false);
      var files = (e.dataTransfer || e.originalEvent.dataTransfer).files // Array of all files
      for (var i=0, file; file=files[i]; i++) {loadImage(file)}
    },
    beforeUnload: function(e) {
      e = e || window.event;
      if (e) {
        e.returnValue = 'Your images will be lost!'
      }
      return 'Your images will be lost!'
    }
  }
}()

Pastey.init = function(data) {
  window.onbeforeunload = Pastey.Handlers.beforeUnload
  document.onpaste = Pastey.Handlers.onPaste
  $(document).on('dragover', Pastey.Handlers.onDragover)
  $(document).on('drop', Pastey.Handlers.onDrop)
  $('.shortlink-btn').click(Pastey.Handlers.getShortlink)

  if (data.length > 0) {
    var btn = $('.shortlink-btn')
      , input = $('.shortlink-address')

    input.val(window.location.href.split('#')[0])
    btn.hide()
    input.show()

    data.map(function(d) {
      Pastey.Images.addImage(d)
    })
  }
}
