(() => {

  /*
   * Detecta cuando Chrome está usando
   * "Sitio para ordenador" en un teléfono.
   */

  const isPhoneDesktopMode =
    window.matchMedia('(pointer: coarse)').matches &&
    screen.width < 700 &&
    window.innerWidth > screen.width * 1.5;

  if (isPhoneDesktopMode) {

    document.body.classList.add(
      'mobile-desktop-mode'
    );

    document.body.style.setProperty(
      '--device-width',
      `${screen.width}px`
    );

  }

  const canvas =
    document.querySelector('#board');

  const ctx =
    canvas.getContext('2d');

  const N = 20;

  const cell =
    canvas.width / N;

  const scoreEl =
    document.querySelector('#score');

  const bestEl =
    document.querySelector('#best');

  const overlay =
    document.querySelector('#message');

  const title =
    document.querySelector('#headline');

  const subtitle =
    document.querySelector('#subtitle');

  const start =
    document.querySelector('#start');

  let snake;
  let food;
  let dir;
  let next;
  let score;
  let timer;
  let running = false;

  let best =
    Number(
      localStorage.snakeBest || 0
    );

  bestEl.textContent = best;


  function reset() {

    snake = [
      {
        x: 10,
        y: 10
      },
      {
        x: 9,
        y: 10
      },
      {
        x: 8,
        y: 10
      }
    ];

    dir = {
      x: 1,
      y: 0
    };

    next = dir;

    score = 0;

    scoreEl.textContent = 0;

    food = spawn();

  }


  function spawn() {

    let p;

    do {

      p = {
        x: Math.floor(
          Math.random() * N
        ),

        y: Math.floor(
          Math.random() * N
        )
      };

    } while (
      snake.some(
        s =>
          s.x === p.x &&
          s.y === p.y
      )
    );

    return p;

  }


  function draw() {

    ctx.fillStyle = '#0b2119';

    ctx.fillRect(
      0,
      0,
      600,
      600
    );


    /*
     * Cuadrícula
     */

    ctx.strokeStyle = '#174331';

    ctx.lineWidth = 1;

    for (
      let i = 1;
      i < N;
      i++
    ) {

      ctx.beginPath();

      ctx.moveTo(
        i * cell,
        0
      );

      ctx.lineTo(
        i * cell,
        600
      );

      ctx.moveTo(
        0,
        i * cell
      );

      ctx.lineTo(
        600,
        i * cell
      );

      ctx.stroke();

    }


    /*
     * Fruta
     */

    ctx.fillStyle = '#ff826c';

    ctx.beginPath();

    ctx.arc(
      (food.x + .5) * cell,
      (food.y + .5) * cell,
      cell * .31,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /*
     * Tallo
     */

    ctx.fillStyle = '#91cf45';

    ctx.fillRect(
      (food.x + .47) * cell,
      (food.y + .12) * cell,
      cell * .12,
      cell * .22
    );


    /*
     * Serpiente
     */

    snake.forEach(
      (s, i) => {

        ctx.fillStyle =
          i
            ? '#78da9c'
            : '#d6f875';

        ctx.beginPath();

        ctx.roundRect(
          s.x * cell + 2,
          s.y * cell + 2,
          cell - 4,
          cell - 4,
          7
        );

        ctx.fill();

      }
    );


    /*
     * Ojos
     */

    const h = snake[0];

    ctx.fillStyle = '#173720';

    ctx.fillRect(
      (h.x + .68) * cell,
      (h.y + .25) * cell,
      3,
      3
    );

    ctx.fillRect(
      (h.x + .68) * cell,
      (h.y + .65) * cell,
      3,
      3
    );

  }


  function tick() {

    dir = next;

    const head = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y
    };


    /*
     * Colisión con paredes
     * o con el cuerpo
     */

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= N ||
      head.y >= N ||
      snake.some(
        s =>
          s.x === head.x &&
          s.y === head.y
      )
    ) {

      end();

      return;

    }


    snake.unshift(head);


    /*
     * Comer fruta
     */

    if (
      head.x === food.x &&
      head.y === food.y
    ) {

      score += 10;

      scoreEl.textContent = score;


      /*
       * Guardar récord
       */

      if (score > best) {

        best = score;

        localStorage.snakeBest =
          best;

        bestEl.textContent =
          best;

      }

      food = spawn();

    } else {

      snake.pop();

    }

    draw();

  }


  function end() {

    running = false;

    clearInterval(timer);

    title.textContent =
      '¡Fin del juego!';

    subtitle.textContent =
      `Conseguiste ${score} puntos.`;

    start.textContent =
      'Jugar de nuevo';

    overlay.classList.remove(
      'hidden'
    );

  }


  function play() {

    reset();

    draw();

    running = true;

    overlay.classList.add(
      'hidden'
    );

    clearInterval(timer);

    timer = setInterval(
      tick,
      120
    );

  }


  function setDir(name) {

    const d = {

      up: {
        x: 0,
        y: -1
      },

      down: {
        x: 0,
        y: 1
      },

      left: {
        x: -1,
        y: 0
      },

      right: {
        x: 1,
        y: 0
      }

    }[name];


    /*
     * Evitar girar directamente
     * hacia el lado contrario
     */

    if (
      d &&
      !(
        d.x === -dir.x &&
        d.y === -dir.y
      )
    ) {

      next = d;

    }

  }


  /*
   * Teclado
   */

  addEventListener(
    'keydown',
    e => {

      const key =
        e.key.toLowerCase();

      const map = {

        arrowup: 'up',
        w: 'up',

        arrowdown: 'down',
        s: 'down',

        arrowleft: 'left',
        a: 'left',

        arrowright: 'right',
        d: 'right'

      };


      if (map[key]) {

        e.preventDefault();

        setDir(
          map[key]
        );


        /*
         * Permite comenzar
         * usando el teclado
         */

        if (!running) {
          play();
        }

      }

    }
  );


  /*
   * Botones táctiles
   */

  document
    .querySelectorAll('[data-dir]')
    .forEach(
      b =>
        b.addEventListener(
          'click',
          () =>
            setDir(
              b.dataset.dir
            )
        )
    );


  /*
   * Botón Jugar
   */

  start.addEventListener(
    'click',
    play
  );


  /*
   * Inicializar
   */

  reset();

  draw();

})();
