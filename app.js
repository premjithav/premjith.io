document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl");
    const instructionOverlay = document.getElementById("instructionOverlay");

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    // Fragment shader program
    const fsSource = `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;

    // Initialize shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect shader attributes
    const programInfo = {
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        program: shaderProgram,
    };

    // Set up vertices
    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];

    // Create a buffer
    const positionBuffer = gl.createBuffer();

    // Bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Pass the vertices to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Mock RISC-V instructions
    const riscvInstructions = [
        "ADD x1, x2, x3",
        "ADDW x1, x2, x3",
        "ADDI x1, x2, imm",
        "ADDIW x1, x2, imm",
        "AND x1, x2, x3",
        "ANDI x1, x2, imm",
        "AUIPC x1, imm",
        "BEQ x1, x2, offset",
        "BGE x1, x2, offset",
        "BGEU x1, x2, offset",
        "BLT x1, x2, offset",
        "BLTU x1, x2, offset",
        "BNE x1, x2, offset",
        "CSRRCI x1, csr, zimm",
        "CSRRSI x1, csr, zimm",
        "CSRRCI x1, csr, zimm",
        "CSRRW x1, csr, x2",
        "CSRRS x1, csr, x2",
        "CSRRC x1, csr, x2",
        "DIV x1, x2, x3",
        "DIVU x1, x2, x3",
        "DIVUW x1, x2, x3",
        "DIVW x1, x2, x3",
        "EBREAK",
        "ECALL",
        "FADD.D x1, x2, x3",
        "FCVT.D.S x1, x2",
        "FCVT.D.W x1, x2",
        "FCVT.D.WU x1, x2",
        "FCVT.S.D x1, x2",
        "FCVT.W.D x1, x2",
        "FCVT.WU.D x1, x2",
        "FDIV.D x1, x2, x3",
        "FEQ.D x1, x2, x3",
        "FEQ.S x1, x2, x3",
        "FCVT.S.D x1, x2",
        "FENCE",
        "FENCE.I",
        "FLE.D x1, x2, x3",
        "FLE.S x1, x2, x3",
        "FLW f1, imm(x2)",
        "FLD f1, imm(x2)",
        "FMADD.D x1, x2, x3, x4",
        "FMADD.S x1, x2, x3, x4",
        "FMAX.D x1, x2, x3",
        "FMAX.S x1, x2, x3",
        "FMIN.D x1, x2, x3",
        "FMIN.S x1, x2, x3",
        "FMSUB.D x1, x2, x3, x4",
        "FMSUB.S x1, x2, x3, x4",
        "FMUL.D x1, x2, x3",
        "FMUL.S x1, x2, x3",
        "FNMSUB.D x1, x2, x3, x4",
        "FNMSUB.S x1, x2, x3, x4",
        "FNMADD.D x1, x2, x3, x4",
        "FNMADD.S x1, x2, x3, x4",
        "FSW f1, imm(x2)",
        "FSD f1, imm(x2)",
        "FSQRT.D x1, x2",
        "FSQRT.S x1, x2",
        "FSUB.D x1, x2, x3",
        "FSUB.S x1, x2, x3",
        "JAL x1, offset",
        "JALR x1, x2, offset",
        "LB x1, imm(x2)",
        "LBU x1, imm(x2)",
        "LD x1, imm(x2)",
        "LDU x1, imm(x2)",
        "LH x1, imm(x2)",
        "LHU x1, imm(x2)",
        "LQ x1, imm(x2)",
        "LQU x1, imm(x2)",
        "LW x1, imm(x2)",
        "LWU x1, imm(x2)",
        "MAC.D x1, x2, x3",
        "MAC.S x1, x2, x3",
        "MADD.D x1, x2, x3, x4",
        "MADD.S x1, x2, x3, x4",
        "MADDU.D x1, x2, x3, x4",
        "MADDU.S x1, x2, x3, x4",
        "MIN.D x1, x2, x3",
        "MIN.S x1, x2, x3",
        "MINA.D x1, x2, x3",
        "MINA.S x1, x2, x3",
        "MULA.D x1, x2, x3, x4",
        "MULA.S x1, x2, x3, x4",
        "MUL.D x1, x2, x3",
        "MUL.S x1, x2, x3",
        "MULH.D x1, x2, x3",
        "MULH.S x1, x2, x3",
        "MULHSU.D x1, x2, x3",
        "MULHSU.S x1, x2, x3",
        "MULHU.D x1, x2, x3",
        "MULHU.S x1, x2, x3",
        "MULQ.D x1, x2, x3",
        "MULQ.S x1, x2, x3",
        "OR x1, x2, x3",
        "ORI x1, x2, imm",
        "PAUSE",
        "RDHWR",
        "REM.D x1, x2, x3",
        "REM.S x1, x2, x3",
        "REM.U.D x1, x2, x3",
        "REM.U.S x1, x2, x3",
        "ROTL x1, x2, x3",
        "ROTR x1, x2, x3",
        "ROTLW x1, x2, x3",
        "ROTRW x1, x2, x3",
        "SB x1, imm(x2)",
        "SD x1, imm(x2)",
        "SDU x1, imm(x2)",
        "SH x1, imm(x2)",
        "SQ x1, imm(x2)",
        "SHU x1, imm(x2)",
        "SLL x1, x2, x3",
        "SLLI x1, x2, shamt",
        "SLLIW x1, x2, shamt",
        "SLLQ x1, x2, x3",
        "SLT x1, x2, x3",
        "SLTI x1, x2, imm",
        "SLTIU x1, x2, imm",
        "SLTU x1, x2, x3",
        "SLTUW x1, x2, x3",
        "SLTUQ x1, x2, x3",
        "SNE x1, x2, x3",
        "SNEI x1, x2, imm",
        "SNEU x1, x2, x3",
        "SNEUW x1, x2, x3",
        "SNEUQ x1, x2, x3",
        "SRA x1, x2, x3",
        "SRAI x1, x2, shamt",
        "SRAIW x1, x2, shamt",
        "SRAQ x1, x2, x3",
        "SRL x1, x2, x3",
        "SRLI x1, x2, shamt",
        "SRLIW x1, x2, shamt",
        "SRLQ x1, x2, x3",
        "ST x1, imm(x2)",
        "SUB x1, x2, x3",
        "SUBW x1, x2, x3",
        "SW x1, imm(x2)",
        "SWU x1, imm(x2)",
        "SWUQ x1, imm(x2)",
        "SYNC",
        "SYNCI",
        "UADD.D x1, x2, x3",
        "UADD.S x1, x2, x3",
        "UNPAUSE",
        "UREM.D x1, x2, x3",
        "UREM.S x1, x2, x3",
        "UREMU.D x1, x2, x3",
        "UREMU.S x1, x2, x3",
        "URSH.D x1, x2, x3",
        "URSH.S x1, x2, x3",
        "URSH.W x1, x2, x3",
        "URSH.WU x1, x2, x3",
        "URSH.Q x1, x2, x3",
        "XOR x1, x2, x3",
        "XORI x1, x2, imm",
        "C.ADD x1, x2, x3",
        "C.ADDI x1, imm",
        "C.ADDIW x1, imm",
        "C.ADDI4SPN x1, imm",
        "C.ADDI16SP x1, imm",
        "C.AND x1, x2, x3",
        "C.ANDI x1, imm",
        "C.BEQZ x1, offset",
        "C.BNEZ x1, offset",
        "C.EBREAK",
        "C.J x1, offset",
        "C.JAL x1, offset",
        "C.JALR x1",
        "C.JR x1",
        "C.LI x1, imm",
        "C.LUI x1, imm",
        "C.LW x1, imm(x2)",
        "C.LD x1, imm(x2)",
        "C.MV x1, x2",
        "C.OR x1, x2, x3",
        "C.SLLI x1, shamt",
        "C.SLLI64 x1, shamt",
        "C.SRAI x1, shamt",
        "C.SRAI64 x1, shamt",
        "C.SRLI x1, shamt",
        "C.SRLI64 x1, shamt",
        "C.SUB x1, x2, x3",
        "C.SUBW x1, x2, x3",
        "C.SW x1, imm(x2)",
        "C.SD x1, imm(x2)",
        "C.XOR x1, x2, x3",
        "C.JALR x1"


    ];

    // Grid dimensions
    const instructionHeight = 21; // Approximate height of each instruction in pixels, including padding
    const instructionWidth = 170; // Approximate width of each instruction in pixels, including padding
    const numRows = Math.floor(window.innerHeight / instructionHeight);
    const numCols = Math.floor(window.innerWidth / instructionWidth);

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function getRandomColor() {
        return Math.random() < 0.5 ? '#0a3799' : '#fdda64';
    }

    function render() {
        drawScene(gl, programInfo, positionBuffer);

        // Clear previous instructions
        instructionOverlay.innerHTML = '';

        // Add instructions to fill the screen
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const instructionDiv = document.createElement('div');
                instructionDiv.className = 'instruction';
                instructionDiv.style.top = `${row * instructionHeight}px`;
                instructionDiv.style.left = `${col * instructionWidth}px`;
                instructionDiv.style.color = getRandomColor();
                instructionDiv.textContent = riscvInstructions[getRandomInt(riscvInstructions.length)];
                instructionOverlay.appendChild(instructionDiv);
            }
        }

        // Request the next frame
        setTimeout(() => {
            requestAnimationFrame(render);
        }, 200); // Update every second
    }

    requestAnimationFrame(render);
});

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function drawScene(gl, programInfo, positionBuffer) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2, // Pull out 2 values per iteration
        gl.FLOAT, // The data in the buffer is 32bit floats
        false, // Don't normalize
        0, // How many bytes to get from one set of values to the next
        0 // How many bytes inside the buffer to start from
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.useProgram(programInfo.program);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
