<?php 
	$level=$_GET["level"];
	$name=$_GET["name"];
	$time=$_GET["time"];
	$date=date("Y-m-d H:i:s");

	$server = "SERVERNAME";
	$databaseName = "DATABASENAME";
	$tableName = "TABLENAME";
	$user_name = "USERNAME";
	$password = "PASSWORD";
	
	//--------------------------------------------------------------------------
	// 1) Connect to mysql database
	//--------------------------------------------------------------------------
	$db_handle = mysql_connect($server, $user_name, $password);
	$dbs = mysql_select_db($databaseName, $db_handle);
	
	//--------------------------------------------------------------------------
	// 2) Query database for data
	//--------------------------------------------------------------------------
	$pdo=new PDO("mysql:dbname=".$databaseName.";host=".$server,$user_name,$password);
	$statement=$pdo->prepare("INSERT INTO scores (level, name, time, date) VALUES (:level, :name, :time, :date)");
	$statement->execute(array(':level'=>$level, ':name'=>$name, ':time'=>$time, ':date'=>$date));
	
	//--------------------------------------------------------------------------
	// 3) echo result as json 
	//--------------------------------------------------------------------------
//	echo $statement;
?>