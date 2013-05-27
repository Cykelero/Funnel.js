<?php

/* SVPbuild 0.7 */

$shouldReturnCompiled = $_GET['returnSource'];

// Parameters
$sourceFolderPath = '../source/';
$compiledDestination = '../build/';

$tabCount = 1;

// Constants
$metadataAreaRegexp = '/\\s*(\\/\\/[^\\n]*\\n\\s*)*/';
$maxDepencyOrderingIterationCount = 10000;

// Result initialization
$compiled = "";
$scriptTagsList = "";

$provided = array();
$internalClasses = array();
$urlList = array();
$tabs = str_repeat("\t", $tabCount);

$libraryList = null;
$fileList = null;
$staticFileList = null;
$productName = null;

$fancyName = null;
$buildVersion = null;
$author = null;
$description = null;

// Makefile parsing
$makefileContents = file_get_contents($sourceFolderPath.'_make.json');

preg_match('/"libraries"\s*:\s*\\[(([^a]|a)+?)\\]/', $makefileContents, $libraryStringListResults);
preg_match_all('/"([^"]+)"/', $libraryStringListResults[1], $libraryListResults);
$libraryList = $libraryListResults[1];

preg_match('/"files"\s*:\s*\\[(([^a]|a)+?)\\]/', $makefileContents, $fileStringListResults);
preg_match_all('/"([^"]+)"/', $fileStringListResults[1], $fileListResults);
$fileList = $fileListResults[1];

preg_match('/"staticFiles"\s*:\s*\\[(([^a]|a)+?)\\]/', $makefileContents, $stringStaticFileListResults);
preg_match_all('/"([^"]+)"/', $stringStaticFileListResults[1], $staticFileListResults);
$staticFileList = $staticFileListResults[1];

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

// Prepare file info objects
$fileInfoList = array();

function addFile($url) {
	global $fileInfoList;
	$fileInfoList[] = array(
		"path" => $url,
		"needs" => array(),
		"provides" => array()
	);
}

foreach ($fileList as $file) {
	addFile($file);
}

// File metadata parsing
for ($i = 0 ; $i < count($fileInfoList) ; $i++) {
	$file = $fileInfoList[$i];
	$filepath = $file["path"];
	$fileContents = file_get_contents("$sourceFolderPath$filepath");
	
	preg_match($metadataAreaRegexp, $fileContents, $fileMetadataAreaResults);
	$fileMetadataArea = $fileMetadataAreaResults[0];
	
	preg_match_all('/(^|\\n)\\s*\/\/ ((provides|needs) ([^\\n]+))/', $fileContents, $fileMetadataResults, PREG_SET_ORDER);
	
	foreach ($fileMetadataResults as $meta) {
		$type = $meta[3];
		$data = $meta[4];
		
		switch ($type) {
			case 'provides':
				$provided[] = $data;
				$fileInfoList[$i]["provides"][] = $data;
				break;
			
			case 'needs':
				$neededFile = $data;
				
				if ($neededFile[0] == '+') {
					$currentFileInfo = pathinfo($filepath);
					$extensionLength = strlen($currentFileInfo['extension']);
					if ($extensionLength) $extensionLength++;
					$strippedFilename = lcfirst(substr($filepath, 0, -$extensionLength));
					
					$neededFile = $strippedFilename.substr($neededFile, 1);
				}
				
				$fileInfoList[$i]["needs"][] = $neededFile;
				
				// Is it already in the list?
				foreach ($fileInfoList as $subFile) {
					if ($subFile["path"] == $neededFile) {
						break 2;
					}
				}
				
				// Not already in the list: add
				addFile($neededFile);
				
				break;
		}
	}
}

// Compute internal classes list (makeshift method)
foreach ($fileInfoList as $file) {
	$filepath = $file["path"];
	$fileInfo = pathinfo($filepath);
	$className = ucfirst($fileInfo["filename"]);
	
	$internalClasses[] = $className;
}

// Dependency ordering
$fileInfoList = array_reverse($fileInfoList);

$iterationCount = 0;
while ($iterationCount++ < $maxDepencyOrderingIterationCount) {
	for ($i = 0 ; $i < count($fileInfoList) ; $i++) {
		$inspectedFile = $fileInfoList[$i];
		$needs = $inspectedFile["needs"];
		
		for ($j = $i+1 ; $j < count($fileInfoList) ; $j++) {
			$possibleDependency = $fileInfoList[$j];
			
			if (in_array($possibleDependency["path"], $needs)) {
				// I needs J, but J precedes I
				array_splice($fileInfoList, $j, 0, array_splice($fileInfoList, $i, 1));
				continue 3;
			}
		}
	}
	break;
}

// Build
$urlList = $libraryList;
foreach ($fileInfoList as $file) {
	$urlList[] = $file["path"];
}

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

// // Wrap
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
foreach ($urlList as $filepath) {
	$fileContents = file_get_contents("$sourceFolderPath$filepath");
	
	// Strip metadata
	preg_match($metadataAreaRegexp, $fileContents, $fileMetadataAreaResults);
	$fileMetadataAreaSize = strlen($fileMetadataAreaResults[0]);
	$fileContents = substr($fileContents, $fileMetadataAreaSize);
	
	// Append
	$compiled .= "/* $filepath */"."\n\n";
	$compiled .= $fileContents."\n";
	
	$scriptTagsList .= $tabs.'<script type="text/javascript" src="'.$sourceFolderPath.$filepath.'"></script>'."\n";
}

$compiled .= "})();\n";

// Write
file_put_contents($compiledDestination.$productName, $compiled);
foreach ($staticFileList as $staticFile) {
	$content = file_get_contents($sourceFolderPath.$staticFile);
	$content = str_replace("./../build/", "", $content);
	
	file_put_contents($compiledDestination.$staticFile, $content);
}

// Return
if (!$shouldReturnCompiled) {
	echo $scriptTagsList;
} else {
	header("Content-Type: text/javascript");
	echo $compiled;
}