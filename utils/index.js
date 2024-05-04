const getProjectName = () => {
  let locationData = window.location.pathname;
  let path = locationData.substring(0, locationData.lastIndexOf("/"));
  let directoryName = path.substring(path.lastIndexOf("/")+1);

  return directoryName;
}

const getCurrentDate = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // Adding 1 because month is zero-based
  const day = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  let currentMoment = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

  return currentMoment;
}

const getTimePercentage = (start, finish) => {
    let currentTime = new Date();
    let startTime = new Date(start);
    let finishTime = new Date(finish);
    
    // Calculate the elapsed time and total time interval in milliseconds
    let elapsedTime = currentTime - startTime;
    let totalTime = finishTime - startTime;
    
    // Calculate the percentage
    let percentage = (elapsedTime / totalTime);
    
    // Return the percentage value
    return percentage;
  }