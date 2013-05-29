var generated = FunnelInstanceSignaturePattern("firstname: string, surname: string, age: number");

console.log(generated(["Nathan", "Manceaux-Panot", 20]));



echoName = Funnel
	("firstname: string, surname: string")
(function(firstname, surname) {
	console.log(firstname + ", " + surname);
});

echoName("John", "Doe");
