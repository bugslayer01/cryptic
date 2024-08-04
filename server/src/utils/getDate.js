//Util file to get Indian standard time and date

export default function getISTDateString() {
    const istDate = new Date(new Date().getTime() + (5 * 60 * 60 * 1000) + (30 * 60 * 1000));

    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    const hours = String(istDate.getHours()).padStart(2, '0');
    const minutes = String(istDate.getMinutes()).padStart(2, '0');
    const seconds = String(istDate.getSeconds()).padStart(2, '0');
    const milliseconds = String(istDate.getMilliseconds()).padStart(3, '0');

    const dateString = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}:${milliseconds}`;

    return dateString;
}