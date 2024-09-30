export const mapSeries = <T>(tasks: Array<() => Promise<T>>): Promise<Array<T>> => {
  return tasks.reduce(
    (promiseChain, currentTask) => {
      return promiseChain.then(chainResults => currentTask().then(currentResult => [...chainResults, currentResult]));
    },
    Promise.resolve([] as Array<T>),
  );
};
