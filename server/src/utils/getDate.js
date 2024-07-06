//Util file to get Indian standard time and date

export default function getISTDateString() {
    const date = new Date();
    const options = {
        timeZone: 'Asia/Kolkata',
        hour12: false
    };
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    const dateString = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;

    return dateString;
}