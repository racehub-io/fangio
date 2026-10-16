import { useRef, useEffect } from 'react';

type Callback = (time: number) => void;

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const useAnimationFrame = (callback: Callback) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = (time: number) => {
    if (previousTimeRef && !!previousTimeRef.current) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current as number);
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);
};

export function useEffectAllDepsChange(fn: () => void, deps: any[]) {
  const prevDeps = usePrevious(deps);
  const changeTarget = useRef<any[] | undefined>(undefined);

  useEffect(() => {
    if (changeTarget.current === undefined) {
      changeTarget.current = prevDeps;
    }

    if (changeTarget.current === undefined) {
      return fn();
    }

    const allDepsChanged = changeTarget.current.every(
      (dep, i) => dep !== deps[i],
    );

    if (allDepsChanged) {
      changeTarget.current = deps;
      return fn();
    }
  }, [fn, prevDeps, deps]);
}
