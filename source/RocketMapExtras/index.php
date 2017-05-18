<?php
    
    require_once('const.php');

    $html = file_get_contents(ORIGINAL_MAP);
    $html = str_replace("<head>", "<head><base href=\"".ORIGINAL_MAP."\">", $html);
    $html= str_replace("</head>", "<link rel='stylesheet' href='".BASE_URL."css/extras.css'></head>", $html);
    $html = str_replace("</body>", "<script src='".BASE_URL."js/extras.js'></script></body>", $html);

    echo $html;
