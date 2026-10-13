let tail = Promise.resolve();

// API mutations and local backup creation share the same free-space budget.
export default async function acquireDiskWrite() {
  const previous = tail;
  let release;
  tail = new Promise((resolve) => { release = resolve; });
  await previous;
  return release;
}
