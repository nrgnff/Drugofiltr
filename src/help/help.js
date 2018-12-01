const isMatching = (full, chunk) => {
    return full.toLowerCase().includes(chunk.toLowerCase());
}

const compareNames = (a, b) => {
    if (a.last_name > b.last_name) {
        return 1;
    }
    if (a.last_name < b.last_name) {
        return -1;
    } 
    if (a.first_name > b.first_name) {
        return 1;
    }
    if (a.last_name < b.first_name) {
        return -1;
    } 
    
    return 0;
}

export {
    isMatching,
    compareNames
}