export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return {
    hours, minutes, seconds: remainingSeconds,
  };
};

export const hmsToSeconds = ({hours, minutes, seconds}) => {
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
}
