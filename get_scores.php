<?php 
	$level=$_GET["level"];

	$server = "SERVERNAME";
	$databaseName = "DATABASENAME";
	$tableName = "TABLENAME";
	$user_name = "USERNAME";
	$password = "PASSWORD";
	
	//--------------------------------------------------------------------------
	// 1) Connect to mysql database
	//--------------------------------------------------------------------------
	$dbs = new mysqli($server, $user_name, $password, $databaseName);
	
	//--------------------------------------------------------------------------
	// 2) Query database for data
	//--------------------------------------------------------------------------
	$pdo=new PDO("mysql:dbname=".$databaseName.";host=".$server,$user_name,$password);
	$statement=$pdo->prepare("SELECT * FROM scores WHERE level=1 ORDER BY time ASC");
	$statement->execute();
	$array1=$statement->fetchAll(PDO::FETCH_ASSOC);
	$statement=$pdo->prepare("SELECT * FROM scores WHERE level=2 ORDER BY time ASC");
	$statement->execute();
	$array2=$statement->fetchAll(PDO::FETCH_ASSOC);
	$statement=$pdo->prepare("SELECT * FROM scores WHERE level=3 ORDER BY time ASC");
	$statement->execute();
	$array3=$statement->fetchAll(PDO::FETCH_ASSOC);
	
	//--------------------------------------------------------------------------
	// 3) echo result as json 
	//--------------------------------------------------------------------------
	echo json_encode( array_merge($array1, $array2, $array3) );
?>
