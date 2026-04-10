El algoritmo de Cohen-Sutherland es un método clásico de recorte de líneas contra una ventana rectangular. La idea central es asignar un código de región (outcode) de 4 bits a cada extremo de la línea, y con operaciones lógicas simples determinar si la línea está trivialmente dentro, trivialmente fuera, o requiere intersección con los bordes de la ventana.
Los 4 bits del outcode codifican: arriba, abajo, derecha, izquierda.

Cómo funciona el algoritmo:
+ Paso 1 — Asignar outcodes. Cada extremo recibe un código de 4 bits. Si el punto está dentro de la ventana, el código es 0000.
BitCondiciónARRIBA (bit 3)y < y_minABAJO (bit 2)y > y_maxDERECHA (bit 1)x > x_maxIZQ (bit 0)x < x_min

+ Paso 2 — Pruebas triviales:
Si outcode_A OR outcode_B == 0 → ambos puntos dentro → aceptar directamente.
Si outcode_A AND outcode_B != 0 → ambos en el mismo lado exterior → rechazar directamente.

+ Paso 3 — Recorte iterativo. Si no se puede decidir trivialmente, se toma un extremo exterior, se calcula su intersección con el borde correspondiente (usando las fórmulas de la recta paramétrica), se reemplaza ese extremo por el punto de intersección y se repite.
La complejidad es O(1) en los casos triviales (la mayoría en la práctica), con un máximo de 4 intersecciones en el peor caso.