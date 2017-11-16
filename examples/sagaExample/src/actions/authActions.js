export function onSignInSuccess(token, user) {
  return function ({ auth, }) {
    auth.setState({ pending: false, token, user: { ...user, token, termsAccepted: false, }, });
  };
}

export function onLeaveAuth() {
  return function ({ auth, }) {
    auth.setState({ error: false, pending: false, });
  };
}

export function setInteractionBlock(blockContentInteraction) {
  return function (dux) {
    dux.setState({ blockContentInteraction, });
  };
}

const dux = { mess: {}, };

const { log, } = console;
export function changeState() {
  // initialState = { a: { b: {} }, c: {} }
  return function (dux) {
    const rootState = dux.state;
    const { a, c, } = dux;
    const cState = c.state;
    const aState = a.state;
    const bState = a.b.state;

    a.b.setState({ x: 1, });

    log(a.b.state === bState);       // false
    log(a.state === aState);         // false
    log(dux.state === rootState); // false
    log(c.state === cState);         // true
  };
}

changeState()

export function browseState() {
  // initialState = { a: { numb: 1 b: {} }, c: 2 }
  return function (dux) {
    const { a, c, } = dux;
    log(a.state); // { numb: 1, b: {} }
    log(c === undefined); // true
    log(dux.state.c); // 2
    const { numb, b, } = a;
    log(numb === undefined); // true
    log(b.state); // {}
  };
}

export function juggleMess() {
  // initialState = { mess: {} }
  return function (dux) {
    let mess = dux.mess.setState({ depth: 0, });
    while (mess.state.depth < 3) {
      const { depth, } = mess.state;
      mess = mess.setState({ mess: { depth: depth+1, }, }).mess;
    }
    console.log(dux.state);
    /* {
      mess: {
        depth: 0, mess: {
          depth: 1, mess: {
            depth: 2, mess: {
              depth: 3
            }
          }
        }
      }
    };*/
  };
}

console.log(juggleMess());
console.log(browseState());