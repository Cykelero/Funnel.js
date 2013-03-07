<?php

/* SVPbuild 0.2 */

$shouldReturnCompiled = $_GET['returnSource'];

// Parameters
$sourceFolderPath = '../source/';
$compiledDestination = '../build/';

$globalObject = 'window';

$tabCount = 1;

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
	
	
	preg_match('/\\s*(\\/\\/[^\\n]*\\n\\s*)*/', $fileContents, $fileMetadataAreaResults);
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


$compiled .= '(function(_global_) {'."\n\n";

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
	$compiled .= "/* $filename */"."\n";
	$compiled .= file_get_contents("$sourceFolderPath$filename")."\n";
	
	$scriptTagsList .= $tabs.'<script type="text/javascript" src="'.$sourceFolderPath.$filename.'"></script>'."\n";
}

// // Exposed classes
$compiled .= "\n";
foreach ($provided as $providedName) {
	$compiled .= "_global_.$providedName = $providedName;"."\n";
}

$compiled .= "\n"."})($globalObject);\n";

// Writing, returning
file_put_contents($compiledDestination.$productName, $compiled);
if (!$shouldReturnCompiled) {
	echo $scriptTagsList;
} else {
	header("Content-Type: text/javascript");
	echo $compiled;
}