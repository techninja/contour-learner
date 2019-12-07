window.onload = function() {
  const canvas = document.getElementById('paper');
  const size = 250;
  const imageBounds = { point: [0, 0], size: [size, size] };
  paper.setup(canvas);
  const $win = $(window);
  const $canvas = $(canvas);
  let image; // Placeholder for the image, once loaded
  const { project: { view } }  = paper;
  let fid = 1;

  const underlay = new paper.Layer({ opacity: 0.5, pivot: [0, 0] });
  const draw = new paper.Layer({ pivot: [0, 0]});

  paper.settings.handleSize = 8

  // Create a simple drawing tool:
  const tool = new paper.Tool();
  let path = null; // Placeholder for the path.

  function startLine(data = null) {
    if (path) path.remove();
    path = new paper.Path({
      strokeWidth: 1,
      strokeColor: 'black',
      pathData: data,
    });
    draw.addChild(path);
    window.path = path;
  }

  // Define a mousedown and mousedrag handler
  tool.onMouseDown = (event) => {
    if (!path) {
      startLine();
      window.path=path;
    }
    path.strokeColor = 'black';
    path.strokeWidth = 1;
    path.add(event.point);
  };

  tool.onMouseDrag = (event) => {
    //console.log(event.point);
    path.add(event.point);
  };

  tool.onMouseUp = (event) => {
    path.simplify(2);
    save();
  };

  tool.activate();

  $('#opacity').on('change input', () => {
    underlay.opacity = $('#opacity').val();
  });

  $('button').click((e) => {
    const $b = $(e.currentTarget);

    switch ($b.attr('id')) {
      case 'restart':
        startLine();
        break;

      case 'next':
        fid = loadFID(fid + 1);
        break;

      case 'previous':
        fid = loadFID(fid - 1);
        break;

      default:
        break;
    }
  })

  $.get('/last', (id) => {
    fid = loadFID(parseInt(id, 10) + 1);
  });

  function save() {
    const id = `${fid}`.padStart(4, '0');
    $.post(`/data/${id}`, {d: path.pathData}, () => {}, 'json');
  }

  window.loadFID = loadFID;
  function loadFID(id) {
    console.log('Load', id);
    if (id > 2000) id = 1;
    if (id < 1) id = 2000;

    const name = `${id}`.padStart(4, '0');
    loadImg(`/faces/${name}.jpg`);
    startLine();
    $.get(`/data/${name}.d`, (data) =>{
      startLine(data);
    });

    return id;
  }

  function loadImg(path) {
    return new Promise((success, error) => {
      underlay.removeChildren();
      image = new paper.Raster(path);
      image.onLoad = () => {
        image.fitBounds(imageBounds);
        success(image);
      };
      image.onError = error;
      window.image = image;
      underlay.addChild(image);
    });
  }

  $win.resize(() => {
    const sizes = [$win.width() - 220, $win.height() - 20];
    const scale = sizes[0] < sizes[1] ? sizes[0] / size : sizes[1] / size;
    view.viewSize = [size * scale, size * scale];
    view.center = [size / 2, size / 2];
    view.zoom = scale;
  }).resize();
}


