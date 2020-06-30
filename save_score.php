<?php 
	$level=$_GET["level"];
	$name=$_GET["name"];
	$time=$_GET["time"];
	$date=date("Y-m-d H:i:s");
	$withoutflags=$_GET["withoutflags"];

	$server = "SERVERNAME";
	$databaseName = "DATABASENAME";
	$tableName = "TABLENAME";
	$user_name = "USERNAME";
	$password = "PASSWORD";
	
	//--------------------------------------------------------------------------
	// 1) Connect to mysql database
	//--------------------------------------------------------------------------
	$mysqli = new mysqli($server, $user_name, $password, $databaseName);
	
	//--------------------------------------------------------------------------
	// 2) Query database for data
	//--------------------------------------------------------------------------
	$pdo=new PDO("mysql:dbname=".$databaseName.";host=".$server,$user_name,$password);
	$statement=$pdo->prepare("INSERT INTO scores (level, name, time, date, withoutflags) VALUES (:level, :name, :time, :date, :withoutflags)");
	$statement->execute(array(':level'=>$level, ':name'=>$name, ':time'=>$time, ':date'=>$date, ':withoutflags'=>$withoutflags));
	
	//--------------------------------------------------------------------------
	// 3) echo result as json 
	//--------------------------------------------------------------------------
//	echo $statement;
?>
