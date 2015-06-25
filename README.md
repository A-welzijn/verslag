# A-Welzijn Verslag

v1.0.7

### Hoe het eruit ziet

![Screenshot](http://i219.photobucket.com/albums/cc319/Gnomepy/Verslag1_zpsctmmwa6j.jpg)

### Hoe het te gebruiken

```javascript
"dependencies": {
	"awelzijn-verslag": "latest"
 }
```
```javascript
var app = angular.module('yourApp', [
	'awelzijn.verslag', 
    'awelzijn.verslageditor',
    'awelzijn.verslagservice'
]);
```

#### Verslag

```html
<a-welzijn-verslag type="type" parent-id="id"></a-welzijn-verslag>
```

Deze directive spreekt de verslag-service aan die de [helper-http](https://github.com/A-welzijn/helper-http)-service gebruikt.

#### Verslag-service

Deze service stuurt via de [helper-http](https://github.com/A-welzijn/helper-http)-service naar de api.

```csharp
[HttpGet()]
public IActionResult ListVersalgen([FromQuery]int parentId, [FromQuery]string type)
```
```csharp
[HttpPost("type/{id:int}")]
public IActionResult InsertForGesprek(int id, [FromBody]Verslag verslag)
```
```csharp
[HttpPut("{id:int}")]
public IActionResult Update(int id, [FromBody]Models.Edit.Verslag verslag)
```
```csharp
[HttpDelete("{type}/{id:int}")]
public IActionResult Delete(string type, int id)
```