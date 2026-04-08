const DEFAULT_GAUSSIAN_MATRIX = `1 1 3
2 4 5
3 5 6`;

const DEFAULT_GAUSSIAN_VECTOR = `1
2
3`;

function parseMatrix(rawText) {
  const rows = rawText
    .trim()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[\s,]+/).map((value) => Number.parseFloat(value)));

  if (rows.length === 0) {
    throw new Error("Please provide at least one matrix row.");
  }

  const columnCount = rows[0].length;
  if (columnCount === 0 || rows.some((row) => row.length !== columnCount || row.some((value) => Number.isNaN(value)))) {
    throw new Error("Matrix A must contain valid numbers and equal-length rows.");
  }

  if (rows.length !== columnCount) {
    throw new Error("Matrix A must be square.");
  }

  return rows;
}

function parseVector(rawText) {
  const values = rawText
    .trim()
    .split(/\n+|[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number.parseFloat(value));

  if (values.length === 0 || values.some((value) => Number.isNaN(value))) {
    throw new Error("Vector b must contain valid numbers.");
  }

  return values;
}

function formatAugmentedMatrix(matrix, vector) {
  return matrix
    .map((row, rowIndex) => {
      const left = row.map((value) => value.toFixed(6).padStart(12, " ")).join(" ");
      const right = vector[rowIndex].toFixed(6).padStart(12, " ");
      return `${left}  | ${right}`;
    })
    .join("\n");
}

function gaussianEliminationPartialPivot(matrix, vector) {
  const a = matrix.map((row) => [...row]);
  const b = [...vector];
  const size = a.length;
  const steps = [];

  for (let pivotIndex = 0; pivotIndex < size - 1; pivotIndex += 1) {
    let pivotRow = pivotIndex;
    let pivotValue = Math.abs(a[pivotIndex][pivotIndex]);

    for (let row = pivotIndex + 1; row < size; row += 1) {
      const candidate = Math.abs(a[row][pivotIndex]);
      if (candidate > pivotValue) {
        pivotValue = candidate;
        pivotRow = row;
      }
    }

    if (pivotValue < 1e-12) {
      throw new Error("Matrix is singular or nearly singular; pivoting failed.");
    }

    if (pivotRow !== pivotIndex) {
      [a[pivotIndex], a[pivotRow]] = [a[pivotRow], a[pivotIndex]];
      [b[pivotIndex], b[pivotRow]] = [b[pivotRow], b[pivotIndex]];
      steps.push(`Step ${steps.length + 1}: swap row ${pivotIndex + 1} with row ${pivotRow + 1}.`);
    } else {
      steps.push(`Step ${steps.length + 1}: keep row ${pivotIndex + 1} as the pivot row.`);
    }

    for (let row = pivotIndex + 1; row < size; row += 1) {
      const factor = a[row][pivotIndex] / a[pivotIndex][pivotIndex];
      a[row][pivotIndex] = 0;
      for (let column = pivotIndex + 1; column < size; column += 1) {
        a[row][column] -= factor * a[pivotIndex][column];
      }
      b[row] -= factor * b[pivotIndex];
      steps.push(`Eliminate row ${row + 1} using factor ${factor.toFixed(6)}.`);
    }

    steps.push(formatAugmentedMatrix(a, b));
  }

  if (Math.abs(a[size - 1][size - 1]) < 1e-12) {
    throw new Error("Matrix is singular or nearly singular; back substitution is not possible.");
  }

  const solution = new Array(size).fill(0);
  for (let row = size - 1; row >= 0; row -= 1) {
    let sum = b[row];
    for (let column = row + 1; column < size; column += 1) {
      sum -= a[row][column] * solution[column];
    }
    solution[row] = sum / a[row][row];
  }

  return { solution, steps, upperMatrix: a, transformedVector: b };
}

function renderSolution(tableBody, solution) {
  tableBody.innerHTML = solution
    .map(
      (value, index) => `
        <tr>
          <td>x${index + 1}</td>
          <td>${value.toFixed(6)}</td>
        </tr>
      `,
    )
    .join("");
}

function setGaussianStatus(statusElement, message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("is-error", isError);
}

function solveGaussianSystem({
  matrixText,
  vectorText,
  statusElement,
  solutionBody,
  stepsOutput,
  successMessage,
}) {
  try {
    const matrix = parseMatrix(matrixText);
    const vector = parseVector(vectorText);
    if (vector.length !== matrix.length) {
      throw new Error("Vector b length must match the size of matrix A.");
    }

    const { solution, steps } = gaussianEliminationPartialPivot(matrix, vector);
    renderSolution(solutionBody, solution);
    stepsOutput.textContent = steps.join("\n\n");
    setGaussianStatus(statusElement, successMessage(matrix.length));
  } catch (error) {
    solutionBody.innerHTML = "";
    stepsOutput.textContent = "";
    setGaussianStatus(statusElement, error instanceof Error ? error.message : "Unexpected Gaussian elimination error.", true);
  }
}

function mountGaussianPage() {
  const exampleMatrixInput = document.querySelector("#gaussian-example-matrix-input");
  const exampleVectorInput = document.querySelector("#gaussian-example-vector-input");
  const exampleSolveButton = document.querySelector("#gaussian-example-solve-button");
  const exampleStatusMessage = document.querySelector("#gaussian-example-status-message");
  const exampleSolutionBody = document.querySelector("#gaussian-example-solution-body");
  const exampleStepsOutput = document.querySelector("#gaussian-example-steps-output");

  const customMatrixInput = document.querySelector("#gaussian-custom-matrix-input");
  const customVectorInput = document.querySelector("#gaussian-custom-vector-input");
  const customSolveButton = document.querySelector("#gaussian-custom-solve-button");
  const customResetButton = document.querySelector("#gaussian-custom-reset-button");
  const customStatusMessage = document.querySelector("#gaussian-custom-status-message");
  const customSolutionBody = document.querySelector("#gaussian-custom-solution-body");
  const customStepsOutput = document.querySelector("#gaussian-custom-steps-output");

  function solveExample() {
    solveGaussianSystem({
      matrixText: exampleMatrixInput.value,
      vectorText: exampleVectorInput.value,
      statusElement: exampleStatusMessage,
      solutionBody: exampleSolutionBody,
      stepsOutput: exampleStepsOutput,
      successMessage: (size) => `Solved the homework example as a ${size}×${size} system with partial pivoting.`,
    });
  }

  function solveCustom() {
    solveGaussianSystem({
      matrixText: customMatrixInput.value,
      vectorText: customVectorInput.value,
      statusElement: customStatusMessage,
      solutionBody: customSolutionBody,
      stepsOutput: customStepsOutput,
      successMessage: (size) => `Solved a custom ${size}×${size} system with partial pivoting.`,
    });
  }

  function resetCustom() {
    customMatrixInput.value = DEFAULT_GAUSSIAN_MATRIX;
    customVectorInput.value = DEFAULT_GAUSSIAN_VECTOR;
    solveCustom();
  }

  exampleSolveButton.addEventListener("click", solveExample);
  customSolveButton.addEventListener("click", solveCustom);
  customResetButton.addEventListener("click", resetCustom);

  solveExample();
  solveCustom();
}

window.mountGaussianPage = mountGaussianPage;
