const getCommentStyle = (lang?: string) => {
    // Based on https://github.com/stackbreak/comment-divider
    switch (lang) {
        case 'bash':
        case 'dockerfile':
        case 'coffeescript':
        case 'ignore':
        case 'julia':
        case 'makefile':
        case 'perl':
        case 'perl6':
        case 'powershell':
        case 'properties':
        case 'python':
        case 'r':
        case 'ruby':
        case 'shell':
        case 'shellscript':
        case 'yaml':
        case 'yml':
        case 'home-assistant':
        case 'plaintext':
            return [' # ', ''];
        case 'html':
        case 'markdown':
        case 'plist':
        case 'xaml':
        case 'xml':
        case 'xsl':
            return ['<!-- ', ' -->'];
        case 'clojure':
        case 'lisp':
        case 'scheme':
        case 'ini':
        case 'rainmeter':
            return [' ; ', ''];
        case 'elm':
        case 'haskell':
        case 'lua':
            return ['  -- ', ''];
        case 'erlang':
        case 'latex':
        case 'matlab':
            return [' %', '%'];
        case 'bat':
            return ['REM ', ''];
        case 'vb':
            return [" ' ", ""];
        default:
            return ['  // ', ''];
    }
};


export default getCommentStyle;
