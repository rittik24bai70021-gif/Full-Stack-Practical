import "@testing-library/jest-dom";

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

window.matchMedia =
  window.matchMedia ||
  function matchMedia() {
    return {
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    };
  };