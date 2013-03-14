<?php

/* SVPbuild 0.4 */

$shouldReturnCompiled = $_GET['returnSource'];

// Parameters
$sourceFolderPath = '../source/';
$compiledDestination = '../build/';

$tabCount = 1;

// Constants
$metadataAreaRegexp = '/\\s*(\\/\\/[^\\n]*\\n\\s*)*/';

// Result initialization
$compiled = "";
$scriptTagsList = "";

$provided = array();
$internalClasses = array();
$tabs = str_repeat("\t", $tabCount);

$fileList = null;
$productName = null;

$fancyName = null;
$buildVersion = null;
$author = null;
$description = null;

// Makefile parsing
$makefileContents = file_get_contents($sourceFolderPath.'_make.json');

preg_match('/"files"\s*:\s*\\[(([^a]|a)+?)\\]/', $makefileContents, $fileStringListResults);
preg_match_all('/"([^"]+)"/', $fileStringListResults[1], $fileListResults);
$fileList = $fileListResults[1];

preg_match('/"productName"\s*:\s*"(([^"]|\\\\")+)"/', $makefileContents, $productNameResults);
$productName = $productNameResults[1];

preg_match('/"fancyName"\s*:\s*"(([^"]|\\\\")+)"/', $makefileContents, $fancyNameResults);
$fancyName = $fancyNameResults[1];

preg_match('/"version"\s*:\s*"(([^"]|\\\\")+)"/', $makefileContents, $buildVersionResults);
$buildVersion = $buildVersionResults[1];

preg_match('/"author"\s*:\s*"(([^"]|\\\\")+)"/', $makefileContents, $authorResults);
$author = $authorResults[1];

preg_match('/"description"\s*:\s*"(([^"]|\\\\")+)"/', $makefileContents, $descriptionResults);
$description = $descriptionResults[1];

// File metadata parsing
for ($i = 0 ; $i < count($fileList) ; $i++) {
	$filename = $fileList[$i];
	$fileContents = file_get_contents("$sourceFolderPath$filename");
	
	
	preg_match($metadataAreaRegexp, $fileContents, $fileMetadataAreaResults);
	$fileMetadataArea = $fileMetadataAreaResults[0];
	
	preg_match_all('/(^|\\n)\\s*\/\/ ((provides|needs) ([^\\n]+))/', $fileContents, $fileMetadataResults, PREG_SET_ORDER);
	
	foreach ($fileMetadataResults as $meta) {
		$type = $meta[3];
		$data = $meta[4];
		
		switch ($type) {
			case 'provides':
				$provided[] = $data;
				break;
			
			case 'needs':
				$neededFile = $data;
				
				if ($neededFile[0] == '+') {
					$currentFileInfo = pathinfo($filename);
					$extensionLength = strlen($currentFileInfo['extension']);
					if ($extensionLength) $extensionLength++;
					$strippedFilename = lcfirst(substr($filename, 0, -$extensionLength));
					
					$neededFile = $strippedFilename.substr($neededFile, 1);
				}
				
				// Is it already in the list?
				foreach ($fileList as $fileName) if ($fileName == $neededFile) break 2;
				
				$fileList[] = $neededFile;
		}
	}
}

// Computing internal classes list (makeshift method)
foreach ($fileList as $fileName) {
	$fileInfo = pathinfo($fileName);
	$className = ucfirst($fileInfo["filename"]);
	
	$internalClasses[] = $className;
}

// Building
$fileList = array_reverse($fileList);

// // Header
$compiled .= '/* ';
$compiled .= $fancyName;
if ($buildVersion) $compiled .= ' '.$buildVersion;
if ($author) $compiled .= ' - '.$author;
$compiled .= ' */'."\n";
if ($description) $compiled .= '/* '.$description.' */'."\n";

$compiled .= "\n";

// // Exposed classes
foreach ($provided as $providedName) {
	$compiled .= "var $providedName;"."\n";
}

$compiled .= "\n";

// // Wrapping
$compiled .= '(function() {'."\n\n";

// // Prereferences
if (count($internalClasses)) {
	$scriptTagsList .= $tabs.'<script type="text/javascript">'."\n";
	foreach ($internalClasses as $className) {
		$scriptTagsList .= $tabs."\t"."var $className;"."\n";
	}
	$scriptTagsList .= $tabs.'</script>'."\n";
}

// // Files
foreach ($fileList as $filename) {
	$fileContents = file_get_contents("$sourceFolderPath$filename");
	
	// Stripping metadata
	preg_match($metadataAreaRegexp, $fileContents, $fileMetadataAreaResults);
	$fileMetadataAreaSize = strlen($fileMetadataAreaResults[0]);
	$fileContents = substr($fileContents, $fileMetadataAreaSize);
	
	// Appending
	$compiled .= "/* $filename */"."\n\n";
	$compiled .= $fileContents."\n";
	
	$scriptTagsList .= $tabs.'<script type="text/javascript" src="'.$sourceFolderPath.$filename.'"></script>'."\n";
}

$compiled .= "})();\n";

// Writing, returning
file_put_contents($compiledDestination.$productName, $compiled);
if (!$shouldReturnCompiled) {
	echo $scriptTagsList;
} else {
	header("Content-Type: text/javascript");
	echo $compiled;
}