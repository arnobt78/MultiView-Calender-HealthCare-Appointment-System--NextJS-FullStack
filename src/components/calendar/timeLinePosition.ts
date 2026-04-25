export function getNowLineTop(now: Date, hourHeight: number) {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return (hours + (minutes + seconds / 60) / 60) * hourHeight;
}
